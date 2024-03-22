'use strict'

const MP = require('multipasta')
const { buffers, boundary } = require('../data')

function process () {
  return new Promise((resolve, reject) => {
    let processedSize = 0
    let partCount = 0
    const parser = MP.make({
      headers: {
        'content-type': 'multipart/form-data; boundary=' + boundary
      },
      onField (_info, value) {
        processedSize += value.length
        partCount++
      },
      onFile (_info) {
        partCount++
        return function (chunk) {
          if (chunk !== null) {
            processedSize += chunk.length
          }
        }
      },
      onError (err) {
        reject(err)
      },
      onDone () {
        resolve([processedSize, partCount])
      }
    })
    for (const buffer of buffers) { parser.write(buffer) }
    parser.end()
  })
}

module.exports = {
  process
}
