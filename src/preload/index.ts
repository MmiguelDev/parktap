import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import type { InfoServidor, RespuestaTap, TapEntrante } from '../shared/types'

const parktap = {
  onTap: (callback: (tap: TapEntrante) => void): (() => void) => {
    const listener = (_evento: IpcRendererEvent, tap: TapEntrante): void => callback(tap)
    ipcRenderer.on('tap', listener)
    return () => ipcRenderer.removeListener('tap', listener)
  },
  responderTap: (requestId: string, respuesta: RespuestaTap): void => {
    ipcRenderer.send('tap-resultado', { requestId, ...respuesta })
  },
  infoServidor: (): Promise<InfoServidor> => ipcRenderer.invoke('servidor-info')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('parktap', parktap)
  } catch (error) {
    console.error(error)
  }
} else {
  window.parktap = parktap
}
