import { useEffect, useState } from 'react'
import type { InfoServidor } from '../../shared/types'
import { listaUsuarios, usuarios } from '../../shared/usuarios'
import { svgCampus, svgGrafica, svgLote, svgLoteSimulado, zonas } from './campus'
import { useParque } from './store'
import { useAlarma } from './alarma'
import { establecerChips, uidParaSimulacion } from '../../shared/cajones'

function hora(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

// Motivos cortos para que quepan en la tabla sin cortarse.
function motivoCorto(motivo: string): string {
  if (motivo.includes('accesible')) return 'Lugar accesible sin permiso'
  if (motivo.includes('maestros')) return 'Lugar de maestros'
  return motivo
}

function marcaDe(elemento: Element, atributo: string): string | null {
  return elemento.closest(`[${atributo}]`)?.getAttribute(atributo) ?? null
}

export default function App(): React.JSX.Element {
  const cajones = useParque((estado) => estado.cajones)
  const registro = useParque((estado) => estado.registro)
  const alertas = useParque((estado) => estado.alertas)
  const denegados = useParque((estado) => estado.denegados)
  const usuarioId = useParque((estado) => estado.usuarioId)
  const elegirUsuario = useParque((estado) => estado.elegirUsuario)
  const aplicar = useParque((estado) => estado.aplicar)
  const ultimo = useParque((estado) => estado.ultimo)
  const [zonaId, setZonaId] = useState('em')
  const [segundos, setSegundos] = useState(2)
  const [info, setInfo] = useState<InfoServidor | null>(null)

  useEffect(() => {
    const reloj = window.setInterval(() => setSegundos((valor) => (valor + 1) % 6), 1000)
    return () => window.clearInterval(reloj)
  }, [])

  useEffect(() => {
    if (!window.parktap) return
    void window.parktap.infoServidor().then(setInfo)
    // Los chips registrados viven en el proceso main (data/chips.json);
    // el renderer usa la misma lista para que procesarTap reconozca los UID reales.
    void window.parktap.obtenerChips().then(establecerChips)
    const quitarChips = window.parktap.onChips(establecerChips)
    const quitarTap = window.parktap.onTap((tap) => {
      const resultado = useParque.getState().aplicar(tap.uidChip, tap.usuario, 'nfc')
      window.parktap.responderTap(tap.requestId, {
        ok: resultado.ok,
        mensaje: resultado.mensaje,
        tipo: resultado.tipo,
        alerta: resultado.infraccion ? resultado.motivoInfraccion : null
      })
    })
    return () => {
      quitarChips()
      quitarTap()
    }
  }, [])

  const ocupadosEm = cajones.filter((cajon) => cajon.estado === 'ocupado').length
  const infracciones = cajones.filter((cajon) => cajon.infraccion).length
  useAlarma(infracciones > 0)
  const lista = zonas.map((zona) => (zona.id === 'em' ? { ...zona, occ: ocupadosEm } : zona))
  // La app del usuario (celular) lee este estado para decirle dónde hay lugar.
  useEffect(() => {
    window.parktap?.reportarEstado({
      cajones: cajones.map(({ id, tipo, estado, infraccion }) => ({
        id,
        tipo,
        estado,
        infraccion
      })),
      zonas: zonas.map((zona) => ({
        id: zona.id,
        name: zona.name,
        tipo: zona.tipo,
        cap: zona.cap,
        occ:
          zona.id === 'em'
            ? cajones.filter((cajon) => cajon.estado === 'ocupado').length
            : zona.occ,
        demo: Boolean(zona.demo)
      }))
    })
  }, [cajones])
  const capacidad = lista.reduce((suma, zona) => suma + zona.cap, 0)
  const ocupados = lista.reduce((suma, zona) => suma + zona.occ, 0)
  const zona = lista.find((item) => item.id === zonaId) ?? lista[1]
  const porcentaje = zona.occ / zona.cap
  const nivel = porcentaje >= 0.9 ? 'alert' : porcentaje >= 0.7 ? 'warn' : 'ok'
  const libresZona = zona.cap - zona.occ
  const nfc = ultimo?.evento?.fuente === 'nfc'
  const grafica = svgGrafica()
  const esquema = info?.https ? 'https' : 'http'

  return (
    <div>
      <header className="switcher">
        <div className="brand">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
          </svg>
          ParkTap
        </div>
        <label className="note" style={{ padding: 0, margin: 0 }}>
          Usuario
          <select
            className="quien"
            style={{ marginLeft: 8 }}
            value={usuarioId}
            onChange={(evento) => elegirUsuario(evento.target.value)}
          >
            {listaUsuarios().map((usuario) => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.nombre}
              </option>
            ))}
          </select>
        </label>
        <span className="live">{nfc ? 'NFC conectado' : 'En vivo'}</span>
      </header>
      <p className="note">
        Universidad Tecnológica de Chihuahua · estacionamientos del campus · da clic en una zona y
        en un cajón del lote E–M.
        {info && info.ips.length > 0 && (
          <span className="mono">
            {' '}
            · celular {esquema}://{info.ips[0]}:{info.puerto}
          </span>
        )}
      </p>

      <main className="wrap">
        <div className="rowhead" style={{ marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 32, lineHeight: 1.15, fontWeight: 800 }}>Panel de dirección</h1>
            <p style={{ color: 'var(--muted)' }}>
              Universidad Tecnológica de Chihuahua · estacionamientos del campus · hoy
            </p>
          </div>
          <span className="live">En vivo · actualizado hace {segundos} s</span>
        </div>

        <section className="grid kpis" aria-label="Indicadores">
          <article className="card kpi">
            <h3>Autos en el campus</h3>
            <div className="v">{ocupados}</div>
            <div className="s">
              de {capacidad} cajones · {Math.round((ocupados / capacidad) * 100)}% ocupado
            </div>
            <div className="bar">
              <i style={{ width: `${(ocupados / capacidad) * 100}%` }} />
            </div>
          </article>
          <article className="card kpi">
            <h3>Lugares libres</h3>
            <div className="v" style={{ color: 'var(--free)' }}>
              {capacidad - ocupados}
            </div>
            <div className="s">disponibles ahora</div>
          </article>
          <article className="card kpi">
            <h3>Accesos denegados hoy</h3>
            <div className="v" style={{ color: 'var(--alert)' }}>
              {denegados.length}
            </div>
            <div className="s">sin permiso o chip no registrado</div>
          </article>
          <article className="card kpi">
            <h3>Infracciones</h3>
            <div className="v" style={{ color: 'var(--warn)' }}>
              {infracciones}
            </div>
            <div className="s">accesible o de maestros sin permiso</div>
          </article>
        </section>

        <section className="grid main abajo">
          <article className="card map">
            <div className="rowhead">
              <h3>Campus · ocupación por zona</h3>
              <div className="legend" style={{ margin: 0 }}>
                <span>
                  <i style={{ background: 'var(--free)' }} />
                  &lt; 70%
                </span>
                <span>
                  <i style={{ background: 'var(--warn)' }} />
                  70–90%
                </span>
                <span>
                  <i style={{ background: 'var(--alert)' }} />
                  &gt; 90%
                </span>
              </div>
            </div>
            <div
              onClick={(evento) => {
                const id = marcaDe(evento.target as Element, 'data-z')
                if (id) setZonaId(id)
              }}
              onKeyDown={(evento) => {
                if (evento.key !== 'Enter' && evento.key !== ' ') return
                const id = marcaDe(evento.target as Element, 'data-z')
                if (!id) return
                evento.preventDefault()
                setZonaId(id)
              }}
              dangerouslySetInnerHTML={{ __html: svgCampus(lista, zonaId) }}
            />
          </article>

          <article className="card map">
            <div className="rowhead">
              <h3>
                {zona.name} · {zona.tipo === 'est' ? 'estudiantes' : 'personal'}
              </h3>
              <span className={`pill ${libresZona ? 'ok' : 'alert'}`}>
                {libresZona ? `Quedan ${libresZona}` : 'Lleno'}
              </span>
            </div>
            <div className="zinfo">
              <span>
                <b>{zona.cap - zona.occ}</b> libres
              </span>
              <span>
                <b>{zona.occ}</b> ocupados
              </span>
              <span className={`pill ${nivel}`}>{Math.round(porcentaje * 100)}% ocupación</span>
              {!zona.demo && (
                <p className="vacio" style={{ width: '100%' }}>
                  Ocupación simulada: este lote todavía no tiene chips NFC. El lote E–M es el de la
                  demo en vivo.
                </p>
              )}
            </div>
            {zona.demo && (
              <div
                onClick={(evento) => {
                  const id = marcaDe(evento.target as Element, 'data-id')
                  if (id) aplicar(uidParaSimulacion(id), usuarioId, 'simulacion')
                }}
                onKeyDown={(evento) => {
                  if (evento.key !== 'Enter' && evento.key !== ' ') return
                  const id = marcaDe(evento.target as Element, 'data-id')
                  if (!id) return
                  evento.preventDefault()
                  aplicar(uidParaSimulacion(id), usuarioId, 'simulacion')
                }}
                dangerouslySetInnerHTML={{
                  __html: svgLote(cajones, (id) => (id ? (usuarios[id]?.placa ?? null) : null))
                }}
              />
            )}
            {!zona.demo && <div dangerouslySetInnerHTML={{ __html: svgLoteSimulado(zona) }} />}
            <div className="legend">
              <span>
                <i style={{ background: 'var(--free)' }} />
                Alumnos libre
              </span>
              <span>
                <i style={{ background: 'var(--staff)' }} />
                Maestros libre
              </span>
              <span>
                <i style={{ background: 'var(--acc)' }} />
                Accesible libre
              </span>
              <span>
                <i style={{ background: 'var(--busy)' }} />
                Ocupado
              </span>
              <span>
                <i style={{ background: 'var(--alert)' }} />
                Infracción
              </span>
            </div>
          </article>
        </section>

        <section className="grid abajo">
          <article className="card">
            <h3>Accesos denegados recientes</h3>
            {denegados.length === 0 ? (
              <p className="vacio">Sin accesos denegados.</p>
            ) : (
              <table className="denegados">
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Quién</th>
                    <th>Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {denegados.map((fila) => {
                    const grave =
                      fila.motivo.includes('accesible') || fila.motivo.includes('maestros')
                    return (
                      <tr key={`${fila.timestamp}-${fila.motivo}`}>
                        <td className="mono hora">{hora(fila.timestamp)}</td>
                        <td>
                          <div className="mono">{fila.placa}</div>
                          <div className={`rol-texto ${fila.rol ?? ''}`}>
                            {fila.rol === 'maestro'
                              ? 'Docente'
                              : fila.rol === 'alumno'
                                ? 'Alumno'
                                : 'Desconocido'}
                          </div>
                        </td>
                        <td>
                          <span className={`pill ${grave ? 'alert' : 'warn'}`}>
                            {motivoCorto(fila.motivo)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </article>
          <article className="card log">
            <h3>Registro en vivo</h3>
            {registro.length === 0 ? (
              <p className="vacio">Todavía no hay entradas ni salidas.</p>
            ) : (
              <ul>
                {registro.map((linea) => {
                  const alerta = alertas.find((item) => item.timestamp === linea.timestamp)
                  return (
                    <li key={`${linea.timestamp}-${linea.cajonId}-${linea.tipo}`}>
                      <span
                        className="dot"
                        style={{
                          background: alerta
                            ? 'var(--alert)'
                            : linea.tipo === 'entrada'
                              ? 'var(--free)'
                              : 'var(--busy)'
                        }}
                      />
                      <div>
                        <div>
                          {linea.tipo === 'entrada' ? 'Entrada' : 'Salida'} · {linea.placa}{' '}
                          <span className={`pill rol ${linea.rol}`}>
                            {linea.rol === 'maestro' ? 'Docente' : 'Alumno'}
                          </span>{' '}
                          {linea.tipo === 'entrada' ? 'en' : 'de'} E–M {linea.cajonId}
                        </div>
                        {alerta && (
                          <span className="pill alert">{alerta.texto.split(' · ').pop()}</span>
                        )}
                      </div>
                      <time>{hora(linea.timestamp)}</time>
                    </li>
                  )
                })}
              </ul>
            )}
          </article>
          <article className="card">
            <h3>
              Ocupación por hora{' '}
              <span style={{ textTransform: 'none', letterSpacing: 0 }}>(datos simulados)</span>
            </h3>
            <div dangerouslySetInnerHTML={{ __html: grafica }} />
          </article>
        </section>
      </main>
    </div>
  )
}
