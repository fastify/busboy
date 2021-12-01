const Busboy = require('busboy');
const { randomBytes } = require('crypto');

const boundary = '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k'

function createMultipartBuffer(boundary, size) {
    const payload = [
        boundary,
        'Content-Disposition: form-data; name="upload_file_0"; filename="1k_a.dat"',
        'Content-Type: application/octet-stream',
        '',
        randomBytes(size).toString('base64'),
        boundary + '--'
    ].join('\r\n')
    return Buffer.from(payload, 'ascii')
}

function process() {
    const busboy = new Busboy({
        headers: {
            'content-type': 'multipart/form-data; boundary=' + boundary
        }
    })
    const mb = 1
    const buffer = createMultipartBuffer(boundary, mb * 1024 * 1024)
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
        busboy.on('file', () => { });

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
