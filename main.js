const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

if (require('electron-squirrel-startup')) return;

function createWindow() {
  const mainWindow = new BrowserWindow({
    minWidth: 850,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      enableRemoteModule: true,
    },
    frame: false,
  })

  mainWindow.maximize();

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile('src/pages/Dashboard/index.html');

  ipcMain.on("request-connection-update", (event, arg) => {
    mainWindow.webContents.send("request-connection-update", arg);
  })
}


app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

process.env.NODE_ENV = "production";