import { createServer } from 'https'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { networkInterfaces } from 'os'
import { randomUUID } from 'crypto'
import express from 'express'
import { BrowserWindow, ipcMain } from 'electron'
import { chips } from '../shared/cajones'
import type { InfoServidor, RespuestaTap, TapEntrante } from '../shared/types'
import { paginaMovil } from './paginaMovil'

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
  })
  ipcMain.handle('servidor-info', () => info)

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
    res.type('html').send(paginaMovil(chips))
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
