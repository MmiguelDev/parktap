import type { Chip, EstadoParque, InfoServidor, RespuestaTap, TapEntrante } from '../shared/types'

export interface ParktapApi {
  onTap: (callback: (tap: TapEntrante) => void) => () => void
  responderTap: (requestId: string, respuesta: RespuestaTap) => void
  reportarEstado: (estado: EstadoParque) => void
  infoServidor: () => Promise<InfoServidor>
  obtenerChips: () => Promise<Chip[]>
  onChips: (callback: (chips: Chip[]) => void) => () => void
}

declare global {
  interface Window {
    parktap: ParktapApi
  }
}
