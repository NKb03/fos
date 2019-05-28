const { app, BrowserWindow } = require('electron')

let win

function showWindow() {
    win = new BrowserWindow({
        width: 400,
        height: 400,
        webPreferences: {
            nodeIntegration: true
        }
    })
    win.on('close', () => { win = null })
    win.loadFile('gui.html')
    win.show()
}

app.on('ready', showWindow)
app.on('activate', () => {
    if (win === null) showWindow()
})
app.on('window-all-closed', () => {
    app.quit()
})