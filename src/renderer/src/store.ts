import { create } from 'zustand'
import { cajonesIniciales } from '../../shared/cajones'
import { procesarTap } from '../../shared/procesarTap'
import type { Cajon, Fuente, LineaRegistro, ResultadoTap } from '../../shared/types'

type Parque = {
  cajones: Cajon[]
  ultimo: ResultadoTap | null
  registro: LineaRegistro[]
  usuarioId: string
  elegirUsuario: (usuarioId: string) => void
  aplicar: (uid: string, usuarioId: string, fuente: Fuente) => ResultadoTap
}

export const useParque = create<Parque>((set, get) => ({
  cajones: cajonesIniciales(),
  ultimo: null,
  registro: [],
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
    set({
      cajones: resultado.cajones,
      ultimo: resultado,
      registro: linea ? [linea, ...get().registro].slice(0, 8) : get().registro
    })
    return resultado
  }
}))
