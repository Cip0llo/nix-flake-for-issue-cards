import { app, BrowserWindow, Menu, ipcMain, nativeTheme, shell } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { registerFileHandlers } from './ipc/fileHandlers'
import { registerNotifyHandlers } from './ipc/notifyHandlers'
import { registerUpdateHandlers } from './ipc/updateHandlers'
import { registerUploadHandlers } from './ipc/uploadHandlers'
import { initUpdater } from './services/UpdaterService'
import { setImgurClientId } from './services/UploadService'

const isDev = false

interface WindowTheme {
  background: string
  dark: boolean
}

const DEFAULT_THEME: WindowTheme = { background: '#000000', dark: true }

const LEGACY_THEMES: Record<string, WindowTheme> = {
  oled: { background: '#000000', dark: true },
  dark: { background: '#0a0a0a', dark: true },
  light: { background: '#ffffff', dark: false },
}

const isHex = (value: unknown): value is string => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)

function themePath(): string {
  return path.join(app.getPath('userData'), 'theme.json')
}

function readTheme(): WindowTheme {
  try {
    const saved = JSON.parse(fs.readFileSync(themePath(), 'utf8'))
    if (isHex(saved.background) && typeof saved.dark === 'boolean') {
      return { background: saved.background, dark: saved.dark }
    }
    if (LEGACY_THEMES[saved.theme]) return LEGACY_THEMES[saved.theme]
  } catch {}
  return DEFAULT_THEME
}

function writeTheme(theme: WindowTheme): void {
  try {
    fs.writeFileSync(themePath(), JSON.stringify(theme))
  } catch {}
}

function applyTheme(win: BrowserWindow, theme: WindowTheme): void {
  nativeTheme.themeSource = theme.dark ? 'dark' : 'light'
  win.setBackgroundColor(theme.background)
}

function openInBrowser(url: unknown): void {
  if (typeof url !== 'string') return
  try {
    const parsed = new URL(url)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') void shell.openExternal(parsed.href)
  } catch {}
}

function isAppUrl(url: string): boolean {
  if (isDev) return url.startsWith('http://localhost:5174')
  return url.startsWith('file://') && url.includes('/renderer/index.html')
}

function createWindow() {
  const theme = readTheme()

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    frame: false,
    backgroundColor: theme.background,
    webPreferences: {
      preload: path.join(__dirname, 'preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  win.once('ready-to-show', () => win.show())

  win.webContents.setWindowOpenHandler(({ url }) => {
    openInBrowser(url)
    return { action: 'deny' }
  })
  win.webContents.on('will-navigate', (event, url) => {
    if (isAppUrl(url)) return
    event.preventDefault()
    openInBrowser(url)
  })

  if (isDev) {
    win.loadURL('http://localhost:5174')
    win.webContents.openDevTools()
    win.webContents.on('console-message', (_event, level, message, line, sourceId) => {
      if (level >= 2) console.log(`[renderer] ${message} (${sourceId}:${line})`)
    })
  } else {
    const htmlPath = path.join(__dirname, '../renderer/index.html')

    win.webContents.on('did-fail-load', (_event, code, description, url) => {
      console.error('Failed:', { code, description, url })
    })

    win.loadFile(htmlPath)
  }

  return win
}

function registerShellHandlers(win: BrowserWindow): void {
  ipcMain.on('shell:setTitle', (_event, title: string) => {
    win.setTitle(title)
  })

  ipcMain.on('shell:setTheme', (_event, _name: string, background: unknown, dark: unknown) => {
    if (!isHex(background) || typeof dark !== 'boolean') return
    const theme: WindowTheme = { background, dark }
    applyTheme(win, theme)
    writeTheme(theme)
  })

  ipcMain.on('window:minimize', () => win.minimize())
  ipcMain.on('window:maximize', () => (win.isMaximized() ? win.unmaximize() : win.maximize()))
  ipcMain.on('window:close', () => win.close())
  ipcMain.handle('window:isMaximized', () => win.isMaximized())

  const sendMaximized = () => {
    if (!win.isDestroyed()) win.webContents.send('window:maximized', win.isMaximized())
  }
  win.on('maximize', sendMaximized)
  win.on('unmaximize', sendMaximized)

  ipcMain.on('shell:openExternal', (_event, url: unknown) => openInBrowser(url))
}

const singleInstance = isDev || app.requestSingleInstanceLock()
if (!singleInstance) app.quit()

app.whenReady().then(() => {
  if (!singleInstance) return

  Menu.setApplicationMenu(null)

  app.setAppUserModelId('com.ezk.issuecards')

  const startTheme = readTheme()
  nativeTheme.themeSource = startTheme.dark ? 'dark' : 'light'

  const win = createWindow()

  app.on('second-instance', () => {
    if (win.isDestroyed()) return
    if (win.isMinimized()) win.restore()
    win.show()
    win.focus()
  })

  registerShellHandlers(win)
  registerUploadHandlers(ipcMain, win)
  registerUpdateHandlers(ipcMain)
  registerNotifyHandlers(ipcMain, win)
  registerFileHandlers(ipcMain, win)
  initUpdater(win)

  ipcMain.on('upload:imgurKey', (_event, value: string) => setImgurClientId(value))

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
