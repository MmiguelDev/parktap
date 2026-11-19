import type { InfoServidor, RespuestaTap, TapEntrante } from '../shared/types'

export interface ParktapApi {
  onTap: (callback: (tap: TapEntrante) => void) => () => void
  responderTap: (requestId: string, respuesta: RespuestaTap) => void
  infoServidor: () => Promise<InfoServidor>
}

declare global {
  interface Window {
    parktap: ParktapApi
  }
}
