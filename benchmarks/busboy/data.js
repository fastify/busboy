'use strict'

const boundary = '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k'
const fileContent = Buffer.from(makeString(1024 * 512), 'utf8')
const fileCount = 2
const fieldContent = Buffer.from(makeString(128), 'utf8')
const fieldCount = 10
const buffers = createMultipartBuffer(boundary)

function makeString (length) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (var i = 0; i < length; i++) { // eslint-disable-line no-var
    result += characters.charAt(Math.floor(Math.random() *
            charactersLength))
  }
  return result
}

function createMultipartBuffer (boundary) {
  const payload = [
    /* eslint-disable no-array-constructor */
    ...Array.from({ length: fieldCount }, (_, i) => [
      '--' + boundary,
      `Content-Disposition: form-data; name="field_${i}"`,
      'Content-Type: application/octet-stream',
      '',
      fieldContent
    ]).flat(),
    /* eslint-disable no-array-constructor */
    ...Array.from({ length: fileCount }, (_, i) => [
      '--' + boundary,
      `Content-Disposition: form-data; name="file_${i}"; filename="file.dat"`,
      'Content-Type: application/octet-stream',
      '',
      fileContent
    ]).flat(),
    '--' + boundary + '--'
  ].join('\r\n')
  const buf = Buffer.from(payload, 'ascii')
  // split into 1400 byte chunks to simulate network packets
  const buffers = []
  for (let i = 0; i < buf.length; i += 1400) {
    buffers.push(buf.subarray(i, i + 1400))
  }
  return buffers
}

module.exports = {
  boundary,
  buffers,
  fileContent,
  fileCount,
  fieldContent,
  fieldCount
}
