const WPAPI = require('wpapi')
const { execSync } = require('child_process')
const { readFileSync, unlinkSync, removeSync } = require('fs-extra')
var cheerio = require('cheerio')

//Nutzt 'pandoc' um das gegebene DOCX-Dokument in eine HTML-Datei umzuwandelen
//Gibt den Pfad der neuen Datei zurueck 
function convert_docx_to_html(file) {
    let output = 'html.html'
    execSync(`pandoc ${file} -o ${output} --extract-media=.`)
    console.info("Converted docx file to HTML")
    return output
}

//Liest den Inhalt der gegebenen Datei
function read_html(file) {
    const content = readFileSync(file).toString('utf8')
    console.info("Read content from HTML file")
    return content
}

//Laedt das Bild hoch und gibt die URL zurueck
function resolve_image(original_path, wp) {
    return wp.media().file(original_path).create({
        title: original_path
    }).catch(function (err) {
        if (err) {
            console.error(err)
        }
    }).then(function (response) {
        console.info('Uploaded media %s', original_path)
        return response.source_url
    })
}

//Laedt alle Bilder die das HTML-Dokument benutzt auf den Server und passt die Links an
async function resolve_images(content, wp) {
    const doc = cheerio.load(content)
    const images = doc('img')
    for (let i = 0; i < images.length; i++) {
        const el = images.get(i)
        const old_src = el.attribs.src
        if (old_src.startsWith("http:") || old_src.startsWith("https:")) {
            continue
        }
        const new_src = await resolve_image(old_src, wp)
        el.attribs.src = new_src
    }
    console.info('Successfully resolved images')
    return doc.html()
}

//Authentifiziert den Wordpress Benutzer
function authenticate_wp() {
    const wp = new WPAPI({
        endpoint: 'http://frankfurterorgelschule.de/wp-json',
        username: 'editor',
        password: 'publicstaticvoid___123',
        auth: true
    })
    console.info("Authenticated to wordpress")
    return wp
}

//Erstellt einen Post mit dem gegebenen Titel und Inhalt
async function create_post(wp, title, content) {
    return wp.posts().create({
        title,
        content,
        status: 'publish'
    }).catch(function (err) {
        console.error(err)
    }).then(function (response) {
        console.info('Successfully created post')
    })
}

//Laedt den Inhalt mit dem gegebenen Titel hoch
async function upload(content, title) {
    const wp = authenticate_wp()
    const resolved = await resolve_images(content, wp)
    console.info('Creating post with title "%s"', title)
    await create_post(wp, title, resolved)
}

//Konvertiert das gegebene Word-Dokument zu einer HTML-Datei und laedt diese mit dem gegebenen Titel hoch
async function upload_docx_file(file, title) {
    let html = convert_docx_to_html(file)
    let content = read_html(html)
    await upload(content, title)
    unlinkSync(html)
    removeSync('media')
}

//Laedt das gegebene HTML-Dokument mit dem gegebenen Titel hoch
async function upload_html_file(file, title) {
    let content = read_html(file)
    await upload(content, title)
}

module.exports = { upload_docx_file, upload_html_file }