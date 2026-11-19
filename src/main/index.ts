import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { iniciarServidor } from './servidor'

let ventanaPrincipal: BrowserWindow | null = null

function createWindow(): void {
  const ventana = new BrowserWindow({
    width: 1360,
    height: 860,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#111111',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      // La alarma de infracción pita sin esperar un clic.
      autoplayPolicy: 'no-user-gesture-required'
    }
  })
  ventanaPrincipal = ventana

  ventana.on('ready-to-show', () => {
    ventana.show()
  })
  ventana.on('closed', () => {
    ventanaPrincipal = null
  })

  ventana.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    ventana.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    ventana.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.parktap.app')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  iniciarServidor(() => ventanaPrincipal)
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
