const { upload_docx_file } = require('./upload')

//Der Einstigespunkt des Programms
async function main() {
    if (process.argv.length != 4) {
        console.error('This command needs exactly 2 arguments')
        process.exit(1)
    }
    const file = process.argv[2]
    const title = process.argv[3]
    if (file.endsWith(".html")) {
        upload_html_file(file, title)
    } else if (file.endsWith(".docx")) {
        upload_docx_file(file, title)
    } else {
        console.error("Invalid file type %s", file)
    }
}

main()