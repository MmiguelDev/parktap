import { LOTE, NOMBRE_TIPO } from '../shared/cajones'
import { listaUsuarios } from '../shared/usuarios'
import type { Chip } from '../shared/types'

function datosJson(chips: Chip[]): string {
  return JSON.stringify({
    chips,
    cajones: LOTE.map((cajon) => ({ id: cajon.id, etiqueta: NOMBRE_TIPO[cajon.tipo] })),
    usuarios: listaUsuarios().map((usuario) => ({
      id: usuario.id,
      nombre: usuario.nombre,
      rol: usuario.rol,
      permisoAccesible: usuario.permisoAccesible,
      placa: usuario.placa
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
  .caja { display: grid; gap: 8px; }
  button { border: 0; border-radius: 10px; min-height: 48px; padding: 12px 14px; background: #e7e7e7; color: #141414; font-weight: 700; }
  button.sec { background: #262626; color: #f4f4f4; border: 1px solid #3a3a3a; }
  button.sec[aria-pressed="true"] { background: #e7e7e7; color: #141414; }
  .modos { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
  .modos button { min-height: 44px; padding: 8px; font-size: 14px; }
  .aviso { font-size: 26px; font-weight: 700; line-height: 1.15; color: #f4f4f4; }
  .aviso.ok { color: #4ade80; }
  .aviso.err { color: #f87171; }
  .uid { font-family: ui-monospace, monospace; font-size: 18px; word-break: break-all; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .alerta { background: #3b1d1d; border: 1px solid #7f1d1d; color: #fecaca; border-radius: 10px; padding: 12px; font-size: 14px; }
  h2 { font-size: 13px; letter-spacing: .08em; text-transform: uppercase; color: #a3a3a3; margin: 0; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  td { padding: 6px 0; border-bottom: 1px solid #2a2a2a; }
  td.mono { font-family: ui-monospace, monospace; font-size: 12px; text-align: right; color: #a3a3a3; word-break: break-all; }
  [hidden] { display: none !important; }
  .modos { grid-template-columns: 1fr 1fr; }
  .hero { border-radius: 14px; padding: 16px; display: grid; gap: 4px; background: #14301f; border: 1px solid #22c55e; }
  .hero.lleno { background: #3b1d1d; border-color: #7f1d1d; }
  .hero b { font-size: 30px; line-height: 1.1; }
  .hero span { color: #d4d4d4; font-size: 15px; }
  .lote { background: #2b2b2b; border-radius: 12px; padding: 10px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .cajon { border-radius: 8px; min-height: 104px; padding: 8px 6px; display: grid; align-content: space-between; text-align: center; border: 2px solid transparent; }
  .cajon .id { font-weight: 800; font-size: 16px; }
  .cajon .tipo { font-size: 11px; font-weight: 700; text-transform: uppercase; opacity: .85; }
  .cajon .est { font-size: 12px; font-weight: 800; }
  .cajon.tuyo { background: #14532d; border-color: #22c55e; color: #dcfce7; }
  .cajon.mejor { box-shadow: 0 0 0 3px #f4f4f4; }
  .cajon.ajeno { background: #262626; border-color: #3a3a3a; color: #8a8a8a; }
  .cajon.ocupado { background: #3f3f46; color: #a1a1aa; }
  .cajon.alerta { background: #7f1d1d; color: #fecaca; }
  .carril { text-align: center; color: #737373; font-size: 12px; letter-spacing: .3em; margin-top: 6px; }
  .zonas { display: grid; gap: 6px; }
  .zona { display: flex; justify-content: space-between; align-items: center; background: #1c1c1c; border: 1px solid #2a2a2a; border-radius: 10px; padding: 10px 12px; }
  .zona small { display: block; color: #8a8a8a; font-size: 12px; }
  .zona .n { font-weight: 800; font-size: 20px; color: #4ade80; }
  .zona .n.poco { color: #fbbf24; }
  .zona .n.cero { color: #f87171; }
  .nota { font-size: 12px; color: #737373; }
  #alarma { position: fixed; inset: 0; z-index: 10; background: #b91c1c; color: #fff; display: grid; place-content: center; gap: 16px; padding: 24px; text-align: center; animation: parpadeo 1s steps(2) infinite; }
  #alarma h2 { color: #fff; font-size: 40px; letter-spacing: 0; text-transform: none; }
  #alarma p { color: #fff; font-size: 20px; }
  #alarma-cajon { font-size: 28px !important; font-weight: 800; }
  @keyframes parpadeo { 50% { background: #7f1d1d; } }
</style>
</head>
<body>
<div id="alarma" role="alertdialog" aria-live="assertive" hidden>
  <h2>¡Mueve tu auto!</h2>
  <p id="alarma-cajon"></p>
  <p id="alarma-motivo"></p>
  <p>Este lugar no es para ti. La alarma se apaga sola cuando saques el auto y acerques el celular al chip del cajón.</p>
</div>
<main>
  <div>
    <h1>ParkTap</h1>
    <p id="ayuda">Elige quién eres y ve dónde hay lugar para ti, en vivo.</p>
  </div>
  <div class="alerta" id="sin-nfc" hidden></div>

  <div class="modos" role="group" aria-label="Modo">
    <button class="sec" type="button" data-modo="lugar" aria-pressed="true">Dónde hay lugar</button>
    <button class="sec" type="button" data-modo="tap" aria-pressed="false">Estacionar</button>
    <button class="sec" type="button" data-modo="reg" aria-pressed="false">Registrar chip</button>
    <button class="sec" type="button" data-modo="uid" aria-pressed="false">Leer UID</button>
  </div>

  <label id="campo-usuario">Usuario
    <select id="usuario"></select>
  </label>
  <label id="campo-cajon" hidden>Cajón donde está pegado el chip
    <select id="cajon"></select>
  </label>

  <section id="vista-lugar" class="caja" style="background:transparent;border:0;padding:0" aria-live="polite">
    <div class="hero" id="hero"><b id="hero-titulo">Cargando…</b><span id="hero-detalle"></span></div>
    <h2>Lote E–M · en vivo</h2>
    <div>
      <div class="lote" id="mini-lote"></div>
      <div class="carril">← EDIFICIO E · · · EDIFICIO M →</div>
    </div>
    <h2>Otros lotes</h2>
    <div class="zonas" id="otras-zonas"></div>
    <p class="nota" id="actualizado"></p>
  </section>

  <button id="leer" type="button" hidden>Activar lector NFC</button>

  <section class="caja" id="caja-mensaje" aria-live="polite" hidden>
    <p class="aviso" id="mensaje">Esperando tap...</p>
    <p class="uid" id="uid"></p>
  </section>

  <section id="bloque-respaldo" hidden>
    <h2>Si el NFC falla</h2>
    <div class="grid" id="respaldos" style="margin-top:8px"></div>
  </section>

  <section id="bloque-registrados" hidden>
    <h2>Chips registrados</h2>
    <table><tbody id="registrados"></tbody></table>
  </section>
</main>
<script id="datos" type="application/json">${datosJson(chips)}</script>
<script>
const datos = JSON.parse(document.getElementById('datos').textContent)
const $ = (id) => document.getElementById(id)
const usuario = $('usuario')
const cajon = $('cajon')
const mensaje = $('mensaje')
const uidBox = $('uid')
let modo = 'lugar'
let chips = datos.chips
let lectorActivo = false
let audio = null

// El audio del celular solo arranca después de un toque, por eso se prepara
// al pulsar "Activar lector NFC" o un botón de respaldo.
function prepararAudio() {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)()
    if (audio.state === 'suspended') audio.resume()
  } catch {}
}

// Alarma de infracción: pantalla roja sin botón de cerrar, pitido y vibración
// cada segundo hasta que el cajón quede libre (tap de salida en el chip, o el
// panel lo libera). El celular revisa la laptop cada 2 s para saberlo.
let alarmaCajon = null
let alarmaPitido = null
let alarmaRevision = null
let bloqueoPantalla = null

function pitidoFuerte() {
  if (navigator.vibrate) navigator.vibrate([400, 100, 400])
  if (!audio) return
  if (audio.state === 'suspended') audio.resume()
  ;[0, 0.5].forEach((inicio) => {
    const osc = audio.createOscillator()
    const vol = audio.createGain()
    osc.type = 'square'
    osc.frequency.value = 1000
    vol.gain.value = 1
    osc.connect(vol).connect(audio.destination)
    const t = audio.currentTime + inicio
    osc.start(t)
    osc.stop(t + 0.35)
  })
}

function avisoSalir(evento) {
  evento.preventDefault()
  evento.returnValue = ''
}

async function iniciarAlarma(cajonId, motivo) {
  alarmaCajon = cajonId
  $('alarma-cajon').textContent = cajonId ? 'Cajón ' + cajonId : ''
  $('alarma-motivo').textContent = motivo
  $('alarma').hidden = false
  window.addEventListener('beforeunload', avisoSalir)
  try {
    if ('wakeLock' in navigator) bloqueoPantalla = await navigator.wakeLock.request('screen')
  } catch {}
  if (alarmaPitido) return
  pitidoFuerte()
  alarmaPitido = setInterval(pitidoFuerte, 1100)
  alarmaRevision = setInterval(async () => {
    try {
      const lista = await (await fetch('/infracciones')).json()
      if (!lista.includes(alarmaCajon)) detenerAlarma()
    } catch {}
  }, 2000)
}

function detenerAlarma() {
  clearInterval(alarmaPitido)
  clearInterval(alarmaRevision)
  alarmaPitido = null
  alarmaRevision = null
  alarmaCajon = null
  $('alarma').hidden = true
  window.removeEventListener('beforeunload', avisoSalir)
  if (navigator.vibrate) navigator.vibrate(0)
  if (bloqueoPantalla) bloqueoPantalla.release().catch(() => {})
  bloqueoPantalla = null
  mostrar('Cajón liberado. Gracias por mover el auto.', 'ok')
}

// ---- Dónde hay lugar ----
const NOMBRES_TIPO = { alumno: 'Alumnos', maestro: 'Maestros', accesible: 'Accesible' }
let estadoParque = null
let ultimaLectura = 0

function persona() {
  return datos.usuarios.find((item) => item.id === usuario.value) || datos.usuarios[0]
}

// Mismas reglas que el panel: maestros usan los suyos y los de alumnos;
// los accesibles solo con permiso.
function puedeUsar(quien, tipo) {
  if (tipo === 'accesible') return quien.permisoAccesible
  if (tipo === 'maestro') return quien.rol === 'maestro'
  return true
}

function pintarLugares() {
  if (!estadoParque) return
  const quien = persona()
  const cajonesEm = estadoParque.cajones
  const mios = cajonesEm.filter((c) => c.estado === 'libre' && puedeUsar(quien, c.tipo))
  // Recomendado: primero el de su tipo (accesible o maestros), luego alumnos.
  const orden = { accesible: 0, maestro: 1, alumno: 2 }
  const mejor = mios.slice().sort((a, b) => orden[a.tipo] - orden[b.tipo])[0]

  const hero = $('hero')
  hero.className = 'hero' + (mios.length ? '' : ' lleno')
  $('hero-titulo').textContent = mios.length
    ? (mios.length === 1 ? 'Hay 1 lugar para ti' : 'Hay ' + mios.length + ' lugares para ti')
    : 'No hay lugar para ti en E–M'
  $('hero-detalle').textContent = mejor
    ? 'Ve directo al cajón ' + mejor.id + ' (' + NOMBRES_TIPO[mejor.tipo] + ') en el Lote E–M.'
    : 'Revisa los otros lotes abajo.'

  const lote = $('mini-lote')
  lote.innerHTML = ''
  cajonesEm.forEach((c) => {
    const caja = document.createElement('div')
    const libre = c.estado === 'libre'
    const tuyo = libre && puedeUsar(quien, c.tipo)
    caja.className = 'cajon ' + (c.infraccion ? 'alerta' : !libre ? 'ocupado' : tuyo ? 'tuyo' : 'ajeno') + (mejor && c.id === mejor.id ? ' mejor' : '')
    const id = document.createElement('div'); id.className = 'id'; id.textContent = c.id
    const tipo = document.createElement('div'); tipo.className = 'tipo'; tipo.textContent = NOMBRES_TIPO[c.tipo]
    const est = document.createElement('div'); est.className = 'est'
    est.textContent = c.infraccion ? 'Sin permiso' : !libre ? 'Ocupado' : tuyo ? 'Libre' : 'No es para ti'
    caja.append(id, tipo, est)
    lote.appendChild(caja)
  })

  const lista = $('otras-zonas')
  lista.innerHTML = ''
  estadoParque.zonas
    .filter((z) => !z.demo && (z.tipo === 'est' || quien.rol === 'maestro'))
    .map((z) => ({ ...z, libres: Math.max(z.cap - z.occ, 0) }))
    .sort((a, b) => b.libres - a.libres)
    .forEach((z) => {
      const fila = document.createElement('div'); fila.className = 'zona'
      const izq = document.createElement('div')
      izq.textContent = z.name
      const sub = document.createElement('small')
      sub.textContent = (z.tipo === 'per' ? 'Personal' : 'Estudiantes') + ' · ' + z.cap + ' cajones · simulado'
      izq.appendChild(sub)
      const n = document.createElement('div')
      const pct = z.libres / z.cap
      n.className = 'n' + (z.libres === 0 ? ' cero' : pct < 0.15 ? ' poco' : '')
      n.textContent = z.libres + ' libres'
      fila.append(izq, n)
      lista.appendChild(fila)
    })
}

async function actualizarLugares() {
  try {
    estadoParque = await (await fetch('/estado')).json()
    ultimaLectura = Date.now()
    pintarLugares()
  } catch {
    $('hero-titulo').textContent = 'Sin conexión con la laptop'
  }
}

setInterval(() => {
  if (modo === 'lugar') actualizarLugares()
  if (ultimaLectura) $('actualizado').textContent = 'Actualizado hace ' + Math.round((Date.now() - ultimaLectura) / 1000) + ' s'
}, 2000)
usuario.addEventListener('change', pintarLugares)

datos.usuarios.forEach((persona) => {
  const opcion = document.createElement('option')
  opcion.value = persona.id
  opcion.textContent = persona.nombre
  usuario.appendChild(opcion)
})

const etiquetas = {}
datos.cajones.forEach((item) => {
  etiquetas[item.id] = item.etiqueta
  const opcion = document.createElement('option')
  opcion.value = item.id
  opcion.textContent = item.id + ' · ' + item.etiqueta
  cajon.appendChild(opcion)
})

function mostrar(texto, tono) {
  mensaje.textContent = texto
  mensaje.className = 'aviso' + (tono ? ' ' + tono : '')
}

function pintarChips() {
  const respaldos = $('respaldos')
  respaldos.innerHTML = ''
  chips.filter((chip) => etiquetas[chip.cajonId]).forEach((chip) => {
    const boton = document.createElement('button')
    boton.type = 'button'
    boton.className = 'sec'
    boton.dataset.uid = chip.uid
    boton.textContent = chip.cajonId + ' · ' + etiquetas[chip.cajonId]
    respaldos.appendChild(boton)
  })
  const tabla = $('registrados')
  tabla.innerHTML = ''
  chips.forEach((chip) => {
    const fila = document.createElement('tr')
    const a = document.createElement('td')
    a.textContent = chip.cajonId
    const b = document.createElement('td')
    b.className = 'mono'
    b.textContent = chip.uid
    fila.append(a, b)
    tabla.appendChild(fila)
  })
}
pintarChips()
actualizarLugares()

// Web NFC solo existe en Chrome para Android y en un contexto seguro (HTTPS o un
// origen marcado como seguro en chrome://flags).
function revisarSoporte() {
  const avisos = []
  if (!window.isSecureContext) {
    avisos.push('Esta página no es un sitio seguro, así que Chrome bloquea el NFC. Sigue el paso 2 de docs/nfc-setup.md (flag de Chrome o HTTPS).')
  }
  if (!('NDEFReader' in window)) {
    avisos.push('Este navegador no tiene Web NFC. Usa Chrome en Android con el NFC encendido.')
  }
  const caja = $('sin-nfc')
  caja.hidden = avisos.length === 0
  caja.textContent = avisos.join(' ')
}
revisarSoporte()

const textos = {
  lugar: 'Elige quién eres y ve dónde hay lugar para ti, en vivo.',
  tap: 'Elige quién estaciona y acerca el celular al chip del cajón.',
  reg: 'Elige el cajón, activa el lector y acerca el chip pegado en ese cajón. Queda guardado en la laptop.',
  uid: 'Acerca cualquier chip para ver su UID sin registrar nada.'
}

document.querySelectorAll('[data-modo]').forEach((boton) => {
  boton.addEventListener('click', () => {
    modo = boton.dataset.modo
    document.querySelectorAll('[data-modo]').forEach((otro) => {
      otro.setAttribute('aria-pressed', String(otro === boton))
    })
    $('ayuda').textContent = textos[modo]
    $('campo-usuario').hidden = modo !== 'tap' && modo !== 'lugar'
    $('vista-lugar').hidden = modo !== 'lugar'
    $('leer').hidden = modo === 'lugar'
    $('caja-mensaje').hidden = modo === 'lugar'
    if (modo === 'lugar') actualizarLugares()
    $('campo-cajon').hidden = modo !== 'reg'
    $('bloque-respaldo').hidden = modo !== 'tap'
    $('bloque-registrados').hidden = modo !== 'reg'
    mostrar(lectorActivo ? 'Acerca el chip al celular.' : 'Activa el lector NFC.')
    uidBox.textContent = ''
  })
})

async function enviarTap(uid) {
  uidBox.textContent = uid
  try {
    const res = await fetch('/tap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uidChip: uid, usuario: usuario.value })
    })
    const data = await res.json()
    const chip = chips.find((item) => item.uid === uid)
    if (data.alerta) {
      mostrar('¡Sin permiso! ' + data.alerta + '. Mueve el auto.', 'err')
      iniciarAlarma(chip ? chip.cajonId : null, data.alerta)
    } else if (alarmaCajon && data.tipo === 'salida') {
      detenerAlarma()
    } else {
      mostrar(data.mensaje || 'Sin respuesta', data.ok ? 'ok' : 'err')
    }
  } catch {
    mostrar('No hubo respuesta de la laptop.', 'err')
  }
}

async function registrar(uid) {
  uidBox.textContent = uid
  const destino = cajon.value
  try {
    const res = await fetch('/registrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: uid, cajonId: destino })
    })
    const data = await res.json()
    if (data.ok) {
      chips = data.chips
      pintarChips()
      mostrar(data.mensaje, 'ok')
      if (navigator.vibrate) navigator.vibrate(120)
      // Avanza al siguiente cajón para registrar los chips seguidos.
      if (cajon.selectedIndex < cajon.options.length - 1) cajon.selectedIndex += 1
    } else {
      mostrar(data.mensaje || 'No se pudo registrar', 'err')
    }
  } catch {
    mostrar('No hubo respuesta de la laptop.', 'err')
  }
}

function alLeer(uid) {
  if (modo === 'uid') {
    uidBox.textContent = uid
    mostrar('UID leído', 'ok')
  } else if (modo === 'reg') {
    registrar(uid)
  } else {
    enviarTap(uid)
  }
}

$('leer').addEventListener('click', async () => {
  prepararAudio()
  if (!('NDEFReader' in window)) {
    mostrar('Web NFC no está disponible aquí. Usa un botón de respaldo.', 'err')
    return
  }
  if (lectorActivo) {
    mostrar('El lector ya está activo. Acerca el chip.')
    return
  }
  try {
    const ndef = new NDEFReader()
    await ndef.scan()
    lectorActivo = true
    $('leer').textContent = 'Lector NFC activo'
    mostrar('Acerca el chip al celular.')
    ndef.onreadingerror = () => mostrar('No se pudo leer el chip. Intenta de nuevo.', 'err')
    ndef.onreading = (event) => {
      const uid = (event.serialNumber || '').toUpperCase()
      if (!uid) {
        mostrar('El chip no entregó serialNumber.', 'err')
        return
      }
      alLeer(uid)
    }
  } catch (error) {
    const nombre = error && error.name
    if (nombre === 'NotAllowedError') mostrar('Permiso de NFC negado. Acéptalo e intenta otra vez.', 'err')
    else if (nombre === 'NotSupportedError') mostrar('El NFC del celular está apagado o no existe.', 'err')
    else mostrar('No se pudo iniciar NFC. Usa un botón de respaldo.', 'err')
  }
})

$('respaldos').addEventListener('click', (event) => {
  const boton = event.target.closest('button[data-uid]')
  if (!boton || modo !== 'tap') return
  prepararAudio()
  enviarTap(boton.dataset.uid)
})
</script>
</body>
</html>`
}
