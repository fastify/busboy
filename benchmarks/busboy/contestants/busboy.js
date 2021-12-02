const Busboy = require('busboy');
const {buffer, boundary} = require("../data");

function process() {
    const busboy = new Busboy({
        headers: {
            'content-type': 'multipart/form-data; boundary=' + boundary
        }
    })
    const mb = 1
    const callbacks =
    {
        partBegin: -1,
        partEnd: -1,
        headerField: -1,
        headerValue: -1,
        partData: -1,
        end: -1
    }

    let processedData = ''

    return new Promise((resolve, reject) => {
        busboy.on('file', (field, file, filename, encoding, mimetype) => {
            console.log('read file')
            file.on('data', (data) => {
                console.log(`File [${filename}] got ${data.length} bytes`);
            });
            file.on('end', (fieldname) => {
                console.log(`File [${fieldname}] Finished`);
            });
        });

        busboy.on('error', function () {
            reject();
        });
        busboy.on('finish', function () {
            resolve(true);
        });
        busboy.write(buffer, () => { })

        busboy.end()
    })
}

module.exports = {
    process
}
