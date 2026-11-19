import { listaUsuarios } from '../shared/usuarios'
import type { Chip } from '../shared/types'

function datosJson(chips: Chip[]): string {
  return JSON.stringify({
    chips,
    usuarios: listaUsuarios().map((usuario) => ({
      id: usuario.id,
      nombre: usuario.nombre
    }))
  }).replace(/</g, '\\u003c')
}

export function paginaMovil(chips: Chip[]): string {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ParkTap</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #111111; color: #f4f4f4; font: 16px/1.4 system-ui, sans-serif; }
  main { max-width: 480px; margin: 0 auto; padding: 20px 16px 32px; display: grid; gap: 16px; }
  h1 { font-size: 28px; margin: 0; }
  p { margin: 0; color: #a3a3a3; }
  label { display: grid; gap: 6px; font-size: 13px; color: #a3a3a3; }
  select, button { font: inherit; }
  select, .caja { background: #262626; border: 1px solid #3a3a3a; border-radius: 10px; color: #f4f4f4; padding: 12px; }
  button { border: 0; border-radius: 10px; min-height: 48px; padding: 12px 14px; background: #e7e7e7; color: #141414; font-weight: 700; }
  button.sec { background: #262626; color: #f4f4f4; border: 1px solid #3a3a3a; }
  button[aria-pressed="true"] { background: #e7e7e7; color: #141414; }
  .aviso { font-size: 28px; font-weight: 700; line-height: 1.15; color: #f4f4f4; }
  .uid { font-family: ui-monospace, monospace; font-size: 18px; word-break: break-all; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  h2 { font-size: 13px; letter-spacing: .08em; text-transform: uppercase; color: #a3a3a3; margin: 0; }
</style>
</head>
<body>
<main>
  <div>
    <h1>ParkTap</h1>
    <p>Elige quién estaciona y acerca el celular al chip del cajón.</p>
  </div>
  <label>Usuario
    <select id="usuario"></select>
  </label>
  <button id="leer" type="button">Leer chip NFC</button>
  <button id="modo-uid" class="sec" type="button" aria-pressed="false">Modo Leer UID</button>
  <section class="caja">
    <p class="aviso" id="mensaje">Esperando tap...</p>
    <p class="uid" id="uid"></p>
  </section>
  <section>
    <h2>Si el NFC falla</h2>
    <div class="grid" id="respaldos"></div>
  </section>
</main>
<script id="datos" type="application/json">${datosJson(chips)}</script>
<script>
const datos = JSON.parse(document.getElementById('datos').textContent)
const usuario = document.getElementById('usuario')
const mensaje = document.getElementById('mensaje')
const uidBox = document.getElementById('uid')
let modoUid = false

datos.usuarios.forEach((persona) => {
  const opcion = document.createElement('option')
  opcion.value = persona.id
  opcion.textContent = persona.nombre
  usuario.appendChild(opcion)
})

datos.chips.forEach((chip) => {
  const boton = document.createElement('button')
  boton.type = 'button'
  boton.className = 'sec'
  boton.dataset.uid = chip.uid
  const extra = chip.repuesto ? ' · repuesto' : chip.cajonId === 'A-01' || chip.cajonId === 'A-02' ? ' · accesible' : ''
  boton.textContent = chip.cajonId + extra
  document.getElementById('respaldos').appendChild(boton)
})

function mostrar(texto) {
  mensaje.textContent = texto
}

document.getElementById('modo-uid').addEventListener('click', () => {
  modoUid = !modoUid
  const boton = document.getElementById('modo-uid')
  boton.setAttribute('aria-pressed', String(modoUid))
  boton.textContent = modoUid ? 'Modo Leer UID activo' : 'Modo Leer UID'
  mostrar(modoUid ? 'Acerca el celular al chip para ver el UID.' : 'Esperando tap...')
})

async function enviar(uid) {
  uidBox.textContent = uid
  try {
    const res = await fetch('/tap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uidChip: uid, usuario: usuario.value })
    })
    const data = await res.json()
    mostrar(data.mensaje || 'Sin respuesta')
  } catch {
    mostrar('No hubo respuesta de la laptop.')
  }
}

document.getElementById('leer').addEventListener('click', async () => {
  if (!('NDEFReader' in window)) {
    mostrar('Web NFC no está disponible. Usa un botón de respaldo.')
    return
  }
  try {
    const ndef = new NDEFReader()
    await ndef.scan()
    mostrar(modoUid ? 'Acerca el chip para leer el UID.' : 'Acerca el chip al celular.')
    ndef.onreading = (event) => {
      const uid = event.serialNumber || ''
      if (!uid) {
        mostrar('El chip no entregó serialNumber.')
        return
      }
      uidBox.textContent = uid
      if (modoUid) {
        mostrar('UID leído')
        return
      }
      enviar(uid)
    }
  } catch {
    mostrar('No se pudo iniciar NFC. Usa un botón de respaldo.')
  }
})

document.getElementById('respaldos').addEventListener('click', (event) => {
  const boton = event.target.closest('button[data-uid]')
  if (!boton || modoUid) return
  enviar(boton.dataset.uid)
})
</script>
</body>
</html>`
}
