import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import type { Chip, EstadoParque, InfoServidor, RespuestaTap, TapEntrante } from '../shared/types'

const parktap = {
  onTap: (callback: (tap: TapEntrante) => void): (() => void) => {
    const listener = (_evento: IpcRendererEvent, tap: TapEntrante): void => callback(tap)
    ipcRenderer.on('tap', listener)
    return () => ipcRenderer.removeListener('tap', listener)
  },
  responderTap: (requestId: string, respuesta: RespuestaTap): void => {
    ipcRenderer.send('tap-resultado', { requestId, ...respuesta })
  },
  reportarEstado: (estado: EstadoParque): void => {
    ipcRenderer.send('estado-parque', estado)
  },
  infoServidor: (): Promise<InfoServidor> => ipcRenderer.invoke('servidor-info'),
  obtenerChips: (): Promise<Chip[]> => ipcRenderer.invoke('chips-obtener'),
  onChips: (callback: (chips: Chip[]) => void): (() => void) => {
    const listener = (_evento: IpcRendererEvent, chips: Chip[]): void => callback(chips)
    ipcRenderer.on('chips', listener)
    return () => ipcRenderer.removeListener('chips', listener)
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('parktap', parktap)
  } catch (error) {
    console.error(error)
  }
} else {
  ;(window as Window & { parktap: typeof parktap }).parktap = parktap
}
