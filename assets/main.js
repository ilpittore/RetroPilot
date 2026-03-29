const { app, BrowserWindow, shell } = require('electron')
const path = require('path')

function createWindow() {

  // ── Splash screen ──────────────────────────────────────────────────────────
  const splash = new BrowserWindow({
    width: 340,
    height: 280,
    frame: false,           // pas de barre de titre
    transparent: true,      // fond transparent (coins arrondis visibles)
    resizable: false,
    center: true,
    alwaysOnTop: true,
    webPreferences: { nodeIntegration: false }
  })
  splash.loadFile('splash.html')

  // ── Fenêtre principale (chargée en arrière-plan) ───────────────────────────
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'RetroPilot',
    show: false,            // cachée jusqu'à ce qu'elle soit prête
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
  })

  win.loadFile('index.html')

  // Quand l'app est prête → fermer la splash, afficher l'app
  win.once('ready-to-show', () => {
    setTimeout(() => {
      splash.destroy()
      win.show()
    }, 500) // petit délai pour que la barre de progression finisse
  })

  // Ouvrir les liens externes dans le vrai navigateur
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  createWindow()

  // Mac : recréer la fenêtre si on clique sur l'icône du dock
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quitter l'app quand toutes les fenêtres sont fermées (sauf Mac)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
