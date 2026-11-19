import { create } from 'zustand'
import { cajonesIniciales } from '../../shared/cajones'
import { procesarTap } from '../../shared/procesarTap'
import type { Cajon, Fuente, ResultadoTap } from '../../shared/types'

type Parque = {
  cajones: Cajon[]
  ultimo: ResultadoTap | null
  aplicar: (uid: string, usuarioId: string, fuente: Fuente) => ResultadoTap
}

export const useParque = create<Parque>((set, get) => ({
  cajones: cajonesIniciales(),
  ultimo: null,
  aplicar: (uid, usuarioId, fuente) => {
    const resultado = procesarTap(uid, usuarioId, fuente, get().cajones)
    set({ cajones: resultado.cajones, ultimo: resultado })
    return resultado
  }
}))
