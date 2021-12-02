const {randomBytes} = require ("crypto");

const mb = 1
const boundary = '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k'
const buffer = createMultipartBuffer(boundary, mb * 1024 * 1024)

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

module.exports = {
    boundary,
    buffer
}
