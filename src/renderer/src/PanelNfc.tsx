import { useParque } from './store'

function hora(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

export function PanelNfc(): React.JSX.Element {
  const ultimo = useParque((estado) => estado.ultimo)

  return (
    <section className="rounded-xl border border-line bg-surface p-5" aria-live="polite">
      <h2 className="text-xs font-medium tracking-widest text-muted uppercase">Panel NFC</h2>
      <p className="mt-3 text-4xl leading-none font-bold">
        {ultimo?.mensaje ?? 'Esperando tap...'}
      </p>
      {ultimo?.infraccion && (
        <p className="mt-3 text-sm font-medium text-ocupado">Cajón accesible sin permiso</p>
      )}
      {!ultimo && (
        <p className="mt-3 text-sm text-muted">Acerca el celular al chip o usa Simular tap.</p>
      )}
      {ultimo && (
        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-inset p-3">
            <dt className="text-muted">UID</dt>
            <dd className="font-mono break-all">{ultimo.evento?.uid ?? '—'}</dd>
          </div>
          <div className="rounded-lg bg-inset p-3">
            <dt className="text-muted">Cajón</dt>
            <dd className="font-mono">{ultimo.evento?.cajonId ?? '—'}</dd>
          </div>
          <div className="rounded-lg bg-inset p-3">
            <dt className="text-muted">Nombre</dt>
            <dd>{ultimo.usuario?.nombre ?? '—'}</dd>
          </div>
          <div className="rounded-lg bg-inset p-3">
            <dt className="text-muted">Placa</dt>
            <dd className="font-mono">{ultimo.usuario?.placa ?? '—'}</dd>
          </div>
          <div className="rounded-lg bg-inset p-3">
            <dt className="text-muted">Resultado</dt>
            <dd>
              {ultimo.tipo === 'entrada'
                ? 'Entrada'
                : ultimo.tipo === 'salida'
                  ? 'Salida'
                  : 'Aviso'}
            </dd>
          </div>
          <div className="rounded-lg bg-inset p-3">
            <dt className="text-muted">Hora</dt>
            <dd className="font-mono">{ultimo.evento ? hora(ultimo.evento.timestamp) : '—'}</dd>
          </div>
        </dl>
      )}
    </section>
  )
}
