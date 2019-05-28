const { upload_docx_file } = require('./upload')
const { dialog } = require('electron').remote

document.getElementById('choose_file').addEventListener('click', (ev) => {
    const path = dialog.showOpenDialog({ properties: ['openFile'], filters: [ {
        name: 'Word Dokumente',
        extensions: ['docx']
    } ] })
    if (path && path.length !== 0) {
        document.getElementById('path').innerHTML = path[0]
    }
})

document.getElementById('upload').addEventListener("click", (ev) => {
    const path = document.getElementById('path')
    const title = document.getElementById('title')
    if (!path.innerHTML) return
    if (!title.value) return
    upload_docx_file(path.innerHTML, title.value)
    path.value = 'Noch keine Datei ausgewählt'
    title.value = ''
})