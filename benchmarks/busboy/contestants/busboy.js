'use strict'

const Busboy = require('busboy')
const { buffers, boundary } = require('../data')

function process () {
  const busboy = Busboy({
    headers: {
      'content-type': 'multipart/form-data; boundary=' + boundary
    }
  })
  let processedSize = 0
  let partCount = 0

  return new Promise((resolve, reject) => {
    busboy.on('file', (field, file, filename, encoding, mimetype) => {
      partCount++
      file.on('data', (data) => {
        processedSize += data.length
      })
    })
    busboy.on('field', (field, value) => {
      processedSize += value.length
      partCount++
    })

    busboy.on('error', function (err) {
      reject(err)
    })
    busboy.on('finish', function () {
      resolve([processedSize, partCount])
    })
    for (const buffer of buffers) { busboy.write(buffer, () => { }) }

    busboy.end()
  })
}

module.exports = {
  process
}
