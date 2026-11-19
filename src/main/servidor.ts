import { createServer } from 'https'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { networkInterfaces } from 'os'
import { randomUUID } from 'crypto'
import express from 'express'
import { BrowserWindow, Notification, ipcMain, shell } from 'electron'
import { esCajonValido, normalizarUid, obtenerChips, registrarChip } from '../shared/cajones'
import type { EstadoParque, InfoServidor, RespuestaTap, TapEntrante } from '../shared/types'
import { paginaMovil } from './paginaMovil'
import { cargarChips, guardarChips } from './registroChips'

type Pendiente = {
  resolve: (respuesta: RespuestaTap) => void
  timer: NodeJS.Timeout
}

const pendientes = new Map<string, Pendiente>()

export function ipsLocales(): string[] {
  const ips: string[] = []
  for (const redes of Object.values(networkInterfaces())) {
    for (const red of redes ?? []) {
      const familia = red.family as string | number
      const v4 = familia === 'IPv4' || familia === 4
      if (v4 && !red.internal) ips.push(red.address)
    }
  }
  return ips
}

function leerCerts(): { cert: Buffer; key: Buffer } | null {
  const dirs = [join(process.cwd(), 'certs'), join(__dirname, '../../certs')]
  for (const dir of dirs) {
    const certPath = join(dir, 'cert.pem')
    const keyPath = join(dir, 'key.pem')
    if (existsSync(certPath) && existsSync(keyPath)) {
      return { cert: readFileSync(certPath), key: readFileSync(keyPath) }
    }
  }
  return null
}

// Aviso del sistema en la Mac del panel: suena aunque la ventana esté minimizada.
function avisarAdministradores(motivo: string): void {
  shell.beep()
  if (!Notification.isSupported()) return
  new Notification({
    title: 'ParkTap · Alerta de acceso',
    body: `${motivo}. Alguien sin credencial ocupó el cajón.`,
    sound: 'Sosumi',
    urgency: 'critical'
  }).show()
}

export function iniciarServidor(ventana: () => BrowserWindow | null): InfoServidor {
  const certificado = leerCerts()
  const info: InfoServidor = {
    puerto: 3000,
    https: Boolean(certificado),
    ips: ipsLocales()
  }
  const appHttp = express()
  appHttp.use(express.json())

  ipcMain.on('tap-resultado', (_evento, respuesta: RespuestaTap & { requestId: string }) => {
    const pendiente = pendientes.get(respuesta.requestId)
    if (!pendiente) return
    clearTimeout(pendiente.timer)
    pendientes.delete(respuesta.requestId)
    pendiente.resolve(respuesta)
    if (respuesta.alerta) avisarAdministradores(respuesta.alerta)
  })
  ipcMain.handle('servidor-info', () => info)

  // Estado del estacionamiento según el panel. El celular lo consulta para
  // mostrar dónde hay lugar y para callar la alarma cuando el auto se quita.
  let estado: EstadoParque = { cajones: [], zonas: [] }
  ipcMain.on('estado-parque', (_evento, nuevo: EstadoParque) => {
    if (nuevo && Array.isArray(nuevo.cajones)) estado = nuevo
  })

  cargarChips()
  ipcMain.handle('chips-obtener', () => obtenerChips())
  const avisarChips = (): void => {
    ventana()?.webContents.send('chips', obtenerChips())
  }

  const consultar = (uidChip: string, usuario: string): Promise<RespuestaTap> =>
    new Promise((resolve, reject) => {
      const destino = ventana()
      if (!destino) {
        reject(new Error('sin ventana'))
        return
      }
      const requestId = randomUUID()
      const timer = setTimeout(() => {
        pendientes.delete(requestId)
        reject(new Error('timeout'))
      }, 5000)
      pendientes.set(requestId, { resolve, timer })
      const tap: TapEntrante = { requestId, uidChip, usuario }
      destino.webContents.send('tap', tap)
    })

  appHttp.get('/', (_req, res) => {
    res.type('html').send(paginaMovil(obtenerChips()))
  })

  appHttp.get('/infracciones', (_req, res) => {
    res.json(estado.cajones.filter((cajon) => cajon.infraccion).map((cajon) => cajon.id))
  })

  appHttp.get('/estado', (_req, res) => {
    res.json(estado)
  })

  appHttp.get('/chips', (_req, res) => {
    res.json(obtenerChips())
  })

  // Registro de chips: el celular lee el chip pegado en un cajón y lo asigna a ese cajón.
  appHttp.post('/registrar', (req, res) => {
    const uid = normalizarUid(String(req.body?.uid ?? ''))
    const cajonId = String(req.body?.cajonId ?? '')
      .trim()
      .toUpperCase()
    if (!uid || uid.startsWith('SIM:')) {
      res.status(422).json({ ok: false, mensaje: 'UID vacío o no válido' })
      return
    }
    if (!esCajonValido(cajonId)) {
      res.status(422).json({ ok: false, mensaje: 'Cajón no válido' })
      return
    }
    const anterior = obtenerChips().find((chip) => chip.uid === uid)
    const lista = registrarChip(uid, cajonId)
    try {
      guardarChips()
    } catch (error) {
      console.error('[parktap] No se pudo guardar data/chips.json', error)
      res.status(500).json({ ok: false, mensaje: 'No se pudo guardar el registro' })
      return
    }
    avisarChips()
    console.log(`[parktap] Chip ${uid} registrado en ${cajonId}`)
    const movido = anterior && anterior.cajonId !== cajonId ? ` (antes en ${anterior.cajonId})` : ''
    res.json({ ok: true, mensaje: `Chip registrado en ${cajonId}${movido}`, chips: lista })
  })

  appHttp.post('/tap', async (req, res) => {
    const uidChip = String(req.body?.uidChip ?? '')
    const usuario = String(req.body?.usuario ?? '')
    try {
      const respuesta = await consultar(uidChip, usuario)
      res.status(respuesta.ok ? 200 : 422).json(respuesta)
    } catch {
      res.status(503).json({
        ok: false,
        mensaje: 'La app no está lista',
        tipo: 'error'
      } satisfies RespuestaTap)
    }
  })

  const alEscuchar = (): void => {
    const esquema = info.https ? 'https' : 'http'
    console.log(`[parktap] ${esquema.toUpperCase()} en el puerto ${info.puerto}`)
    for (const ip of info.ips) {
      console.log(`[parktap] Celular: ${esquema}://${ip}:${info.puerto}`)
    }
    if (!info.https) {
      console.log(
        '[parktap] Sin certificado. Web NFC en el celular necesita HTTPS: docs/nfc-setup.md'
      )
    }
  }

  if (certificado) {
    createServer(certificado, appHttp).listen(info.puerto, '0.0.0.0', alEscuchar)
  } else {
    appHttp.listen(info.puerto, '0.0.0.0', alEscuchar)
  }

  return info
}
