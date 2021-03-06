const setupEvents = require('./installers/setupEvents')
if (setupEvents.handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}


const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

process.env.NODE_ENV = "production";

function createWindow() {
  const mainWindow = new BrowserWindow({
    minWidth: 850,
    minHeight: 600,
    icon: "src/assets/icon/icon_alt.ico",
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
