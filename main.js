const { app, BrowserWindow, Menu, shell, nativeTheme } = require('electron')
const fs = require('fs');

const appName = 'Apple Music'

locale = app.getLocaleCountryCode();
themeFile = null;

const appUrl = 'https://beta.music.apple.com/'

const customCss =
  '.web-navigation__native-upsell {display: none !important;}'

function createWindow() {
  Menu.setApplicationMenu(null)

  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: appName,
    show: false,
    icon: 'apple-music-for-linux.png'
  })
  mainWindow.loadURL(appUrl + locale.toLowerCase() + '/browse')

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyUp' && input.control && input.key.toLowerCase() === 'r') {
      mainWindow.reload();
    }
    else if (input.type === 'keyUp' && input.control && input.key.toLowerCase() === 'd') {
      if (nativeTheme.themeSource === 'dark') {
        nativeTheme.themeSource = 'light'
      }
      else {
        nativeTheme.themeSource = 'dark'
      }
      if (themeFile) {
        fs.writeFileSync(themeFile, nativeTheme.themeSource);
      }
    }
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(appUrl)) {
      event.preventDefault()
      shell.openExternal(url)
    }
  });
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show()
  })
  mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options) => {
    event.preventDefault()
    shell.openExternal(url)
  });

  mainWindow.webContents.on('did-navigate', () => {
    mainWindow.webContents.insertCSS(customCss)
  });

  mainWindow.webContents.on('page-title-updated', () => {
    mainWindow.webContents.insertCSS(customCss)
    mainWindow.setTitle(appName); 
  });

  mainWindow.on("close", () => {
    app.exit(0);
 });
}

app.on('widevine-ready', () => {
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
