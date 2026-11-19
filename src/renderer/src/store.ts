import { create } from 'zustand'
import { cajonesIniciales } from '../../shared/cajones'
import { procesarTap } from '../../shared/procesarTap'
import type { Alerta, Cajon, Fuente, LineaRegistro, ResultadoTap } from '../../shared/types'

type Parque = {
  cajones: Cajon[]
  ultimo: ResultadoTap | null
  registro: LineaRegistro[]
  alertas: Alerta[]
  usuarioId: string
  elegirUsuario: (usuarioId: string) => void
  aplicar: (uid: string, usuarioId: string, fuente: Fuente) => ResultadoTap
}

export const useParque = create<Parque>((set, get) => ({
  cajones: cajonesIniciales(),
  ultimo: null,
  registro: [],
  alertas: [],
  usuarioId: 'ana',
  elegirUsuario: (usuarioId) => set({ usuarioId }),
  aplicar: (uid, usuarioId, fuente) => {
    const resultado = procesarTap(uid, usuarioId, fuente, get().cajones)
    const linea =
      resultado.ok &&
      resultado.evento &&
      resultado.usuario &&
      (resultado.tipo === 'entrada' || resultado.tipo === 'salida')
        ? {
            timestamp: resultado.evento.timestamp,
            placa: resultado.usuario.placa,
            cajonId: resultado.evento.cajonId,
            tipo: resultado.tipo
          }
        : null
    const alerta =
      resultado.infraccion && resultado.evento && resultado.usuario
        ? {
            timestamp: resultado.evento.timestamp,
            texto: `${resultado.evento.cajonId} · ${resultado.usuario.placa} · sin permiso accesible`
          }
        : null
    set({
      cajones: resultado.cajones,
      ultimo: resultado,
      registro: linea ? [linea, ...get().registro].slice(0, 8) : get().registro,
      alertas: alerta ? [alerta, ...get().alertas].slice(0, 4) : get().alertas
    })
    return resultado
  }
}))
