const boundary = '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k'
const randomContent = Buffer.allocUnsafe(1024)
const buffer = createMultipartBuffer(boundary)

function createMultipartBuffer (boundary) {
  const payload = [
    '--' + boundary,
    'Content-Disposition: form-data; name="upload_file_0"; filename="1k_a.dat"',
    'Content-Type: application/octet-stream',
    '',
    randomContent,
    '--' + boundary + '--'
  ].join('\r\n')
  return Buffer.from(payload, 'ascii')
}

module.exports = {
  boundary,
  buffer,
  randomContent
}
