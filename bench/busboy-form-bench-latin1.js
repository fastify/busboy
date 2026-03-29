'use strict'

const Busboy = require('busboy')
const { createMultipartBufferForEncodingBench } = require('./createMultipartBufferForEncodingBench')

for (var i = 0, il = 10000; i < il; i++) { // eslint-disable-line no-var
  const boundary = '-----------------------------168072824752491622650073'
  const busboy = new Busboy({
    headers: {
      'content-type': 'multipart/form-data; boundary=' + boundary
    }
  })
  const buffer = createMultipartBufferForEncodingBench(boundary, 100, 'iso-8859-1')
  const mb = buffer.length / 1048576

  busboy.on('file', (field, file, filename, encoding, mimetype) => {
    file.resume()
  })

  busboy.on('error', function () {
  })
  busboy.on('finish', function () {
  })

  const start = +new Date()
  busboy.end()
  const duration = +new Date() - start
  const mbPerSec = (mb / (duration / 1000)).toFixed(2)
  console.log(mbPerSec + ' mb/sec')
}
