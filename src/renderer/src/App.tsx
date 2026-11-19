import { useEffect, useState } from 'react'
import { chips } from '../../shared/cajones'
import { listaUsuarios } from '../../shared/usuarios'
import type { InfoServidor } from '../../shared/types'
import { PanelNfc } from './PanelNfc'
import { useParque } from './store'

function Simulador(): React.JSX.Element {
  const aplicar = useParque((estado) => estado.aplicar)
  const usuarios = listaUsuarios()
  const [usuarioId, setUsuarioId] = useState(usuarios[0]?.id ?? '')
  const [cajonId, setCajonId] = useState(chips[0]?.cajonId ?? '')
  const [uidManual, setUidManual] = useState('')
  const [info, setInfo] = useState<InfoServidor | null>(null)

  useEffect(() => {
    if (!window.parktap) return
    void window.parktap.infoServidor().then(setInfo)
  }, [])

  const simular = (): void => {
    const chip = chips.find((item) => item.cajonId === cajonId)
    const uid = uidManual.trim() || chip?.uid || ''
    aplicar(uid, usuarioId, 'simulacion')
  }

  const esquema = info?.https ? 'https' : 'http'

  return (
    <section className="rounded-xl border border-line bg-surface p-5">
      <h2 className="text-xs font-medium tracking-widest text-muted uppercase">Plan B</h2>
      <p className="mt-2 text-sm text-muted">
        Elige usuario y cajón. El mismo procesarTap atiende la simulación y el celular.
      </p>
      <div className="mt-4 grid gap-3">
        <label className="grid gap-1 text-sm text-muted">
          Usuario
          <select
            className="min-h-11 rounded-lg border border-line bg-inset px-3 text-paper"
            value={usuarioId}
            onChange={(evento) => setUsuarioId(evento.target.value)}
          >
            {usuarios.map((usuario) => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.nombre}
                {usuario.permisoAccesible ? ' · permiso accesible' : ''}
                {usuario.id === 'infractor' ? ' · infractor' : ''}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm text-muted">
          Cajón
          <select
            className="min-h-11 rounded-lg border border-line bg-inset px-3 text-paper"
            value={cajonId}
            onChange={(evento) => setCajonId(evento.target.value)}
          >
            {chips.map((chip) => (
              <option key={chip.uid} value={chip.cajonId}>
                {chip.cajonId}
                {chip.repuesto ? ' · repuesto' : ''}
                {chip.cajonId === 'A-01' || chip.cajonId === 'A-02' ? ' · accesible' : ''}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm text-muted">
          UID manual, opcional
          <input
            className="min-h-11 rounded-lg border border-line bg-inset px-3 font-mono text-paper"
            value={uidManual}
            placeholder="Déjalo vacío para usar el cajón"
            onChange={(evento) => setUidManual(evento.target.value)}
          />
        </label>
        <button
          type="button"
          className="min-h-12 rounded-lg bg-paper font-bold text-ink"
          onClick={simular}
        >
          Simular tap
        </button>
      </div>
      <div className="mt-5 text-sm text-muted">
        {info ? (
          info.ips.length > 0 ? (
            <ul className="grid gap-1">
              {info.ips.map((ip) => (
                <li key={ip} className="font-mono text-paper">
                  {esquema}://{ip}:{info.puerto}
                </li>
              ))}
              {!info.https && <li>El celular necesita el certificado de docs/nfc-setup.md.</li>}
            </ul>
          ) : (
            <p>No hay IP de red. Conéctate al hotspot para ver la dirección del celular.</p>
          )
        ) : (
          <p>Abre la app de escritorio para ver la dirección del celular.</p>
        )}
      </div>
    </section>
  )
}

export default function App(): React.JSX.Element {
  const ultimo = useParque((estado) => estado.ultimo)
  const nfc = ultimo?.evento?.fuente === 'nfc'

  useEffect(() => {
    if (!window.parktap) return
    return window.parktap.onTap((tap) => {
      const resultado = useParque.getState().aplicar(tap.uidChip, tap.usuario, 'nfc')
      window.parktap.responderTap(tap.requestId, {
        ok: resultado.ok,
        mensaje: resultado.mensaje,
        tipo: resultado.tipo
      })
    })
  }, [])

  return (
    <div className="min-h-screen bg-ink text-paper">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-5 py-3">
        <div className="flex items-center gap-2 text-xl font-bold">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#E7E7E7"
            strokeWidth="2.2"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
          </svg>
          ParkTap
        </div>
        <p className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-inset px-4 text-sm">
          <span className={`h-2.5 w-2.5 rounded-full ${nfc ? 'bg-libre' : 'bg-muted'}`} />
          {nfc ? 'NFC conectado' : 'Modo simulación'}
        </p>
      </header>
      <main className="mx-auto grid max-w-[1100px] gap-4 p-4 lg:grid-cols-2">
        <Simulador />
        <PanelNfc />
      </main>
    </div>
  )
}
