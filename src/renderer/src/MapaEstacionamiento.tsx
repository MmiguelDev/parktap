import { useEffect, useRef, useState } from 'react'
import { uidParaSimulacion } from '../../shared/cajones'
import type { Cajon } from '../../shared/types'
import { usuarios } from '../../shared/usuarios'
import { useParque } from './store'

function Auto(): React.JSX.Element {
  return (
    <svg viewBox="0 0 80 120" className="h-14 w-9" aria-hidden="true">
      <rect x="14" y="8" width="52" height="104" rx="16" fill="#D4D4D4" />
      <rect x="22" y="20" width="36" height="24" rx="4" fill="#141414" opacity="0.65" />
      <rect x="22" y="78" width="36" height="16" rx="4" fill="#141414" opacity="0.4" />
    </svg>
  )
}

function Silla(): React.JSX.Element {
  return (
    <span className="grid h-8 w-8 place-items-center rounded-md bg-accesible text-paper">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="4" r="2" fill="currentColor" stroke="none" />
        <path d="M12 7v6h5l2 5" />
        <path d="M9 10a6 6 0 1 0 6 8" />
      </svg>
    </span>
  )
}

function filaDe(id: string): 'A' | 'B' {
  return id.startsWith('B') ? 'B' : 'A'
}

export function MapaEstacionamiento(): React.JSX.Element {
  const cajones = useParque((estado) => estado.cajones)
  const usuarioId = useParque((estado) => estado.usuarioId)
  const aplicar = useParque((estado) => estado.aplicar)
  const [saliendo, setSaliendo] = useState<string[]>([])
  const anterior = useRef(cajones)

  useEffect(() => {
    const salidas = anterior.current.filter((cajon) => {
      const nuevo = cajones.find((item) => item.id === cajon.id)
      return cajon.estado === 'ocupado' && nuevo?.estado === 'libre'
    })
    anterior.current = cajones
    if (salidas.length === 0) return
    const ids = salidas.map((cajon) => cajon.id)
    setSaliendo((lista) => [...new Set([...lista, ...ids])])
    window.setTimeout(() => {
      setSaliendo((lista) => lista.filter((id) => !ids.includes(id)))
    }, 420)
  }, [cajones])

  const pintarFila = (fila: 'A' | 'B'): React.JSX.Element => (
    <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
      {cajones
        .filter((cajon) => filaDe(cajon.id) === fila)
        .map((cajon) => (
          <CajonSpot
            key={cajon.id}
            cajon={cajon}
            saliendo={saliendo.includes(cajon.id)}
            onElegir={() => aplicar(uidParaSimulacion(cajon.id), usuarioId, 'simulacion')}
          />
        ))}
    </div>
  )

  return (
    <section
      className="rounded-xl border border-line bg-surface p-4"
      aria-label="Mapa del estacionamiento"
    >
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Lote de la demo</h2>
        <p className="text-sm text-muted">
          Vista desde arriba. El clic usa a {usuarios[usuarioId]?.nombre ?? 'nadie'}.
        </p>
      </div>
      <div className="rounded-lg bg-asfalto p-3">
        {pintarFila('A')}
        <div className="relative my-3 flex h-14 items-center">
          <span className="z-10 rounded-full border border-marca px-3 py-1 text-xs font-bold text-marca">
            ENTRADA
          </span>
          <svg
            className="absolute inset-x-24 h-6 text-marca"
            viewBox="0 0 640 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <rect y="10" width="640" height="4" opacity="0.35" />
            <path d="M80 4h28l14 8-14 8H80l14-8zM220 4h28l14 8-14 8h-28l14-8zM360 4h28l14 8-14 8h-28l14-8zM500 4h28l14 8-14 8h-28l14-8z" />
          </svg>
          <span className="z-10 ml-auto text-xs font-bold text-marca">CALLE</span>
        </div>
        {pintarFila('B')}
      </div>
      <ul className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
        <li className="inline-flex items-center gap-1.5">
          <i className="h-3 w-3 rounded-sm bg-libre" />
          Libre
        </li>
        <li className="inline-flex items-center gap-1.5">
          <i className="h-3 w-3 rounded-sm bg-ocupado" />
          Ocupado
        </li>
        <li className="inline-flex items-center gap-1.5">
          <i className="h-3 w-3 rounded-sm bg-accesible" />
          Accesible
        </li>
      </ul>
    </section>
  )
}

function CajonSpot({
  cajon,
  saliendo,
  onElegir
}: {
  cajon: Cajon
  saliendo: boolean
  onElegir: () => void
}): React.JSX.Element {
  const ocupado = cajon.estado === 'ocupado'
  const estado = ocupado ? 'ocupado' : cajon.accesible ? 'accesible' : 'libre'
  const placa = cajon.ocupante ? usuarios[cajon.ocupante]?.placa : null
  const mostrarAuto = ocupado || saliendo

  return (
    <button
      type="button"
      data-state={estado}
      className="cajon relative h-32 rounded-md border-2 text-left"
      aria-label={`Cajón ${cajon.id} ${ocupado ? 'ocupado' : 'libre'}${cajon.accesible ? ', accesible' : ''}`}
      onClick={onElegir}
    >
      <span className="absolute top-2 left-2 text-xs font-bold">{cajon.id}</span>
      {placa && (
        <span className="absolute right-2 bottom-2 left-2 truncate font-mono text-[10px]">
          {placa}
        </span>
      )}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {cajon.accesible && !mostrarAuto && <Silla />}
        {mostrarAuto && (
          <span className={filaDe(cajon.id) === 'B' ? 'block rotate-180' : 'block'}>
            <span className={`block ${saliendo ? 'auto-sale' : 'auto-entra'}`}>
              <Auto />
            </span>
          </span>
        )}
      </span>
    </button>
  )
}
