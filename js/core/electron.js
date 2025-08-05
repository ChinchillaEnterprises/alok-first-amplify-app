const { app, BrowserWindow } = require('electron')
const path = require('path')
const BluetoothManager = require('../systems/bluetooth-main')

let mainWindow = null
let bluetoothManager = null

function createWindow () {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // Enable Bluetooth
      enableBlinkFeatures: 'WebBluetooth'
    },
    icon: path.join(__dirname, 'icon.png'), // You can add an icon later
    titleBarStyle: 'hiddenInset', // macOS style with traffic lights
    backgroundColor: '#000000',
    show: false
  })

  // Load the startup animation first
  mainWindow.loadFile('views/startup.html')

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Start maximized (but not fullscreen)
  mainWindow.maximize()
  
  // Initialize Bluetooth Manager only once
  if (!bluetoothManager) {
    bluetoothManager = new BluetoothManager(mainWindow)
  }
  
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Handle permission requests
app.on('web-contents-created', (event, contents) => {
  contents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    // Allow geolocation, microphone, and other permissions
    const allowed = ['geolocation', 'media', 'microphone', 'camera']
    if (allowed.includes(permission)) {
      callback(true)
    } else {
      callback(true) // Allow other permissions as well
    }
  })
})

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})