'use strict'

const MP = require('multipasta')
const { buffers, boundary } = require('../data')

function process () {
  return new Promise((resolve, reject) => {
    let processedSize = 0
    const parser = MP.make({
      headers: {
        'content-type': 'multipart/form-data; boundary=' + boundary
      },
      onField (_info, value) {
        processedSize += value.length
      },
      onFile (_info) {
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
        resolve(processedSize)
      }
    })
    for (const buffer of buffers) { parser.write(buffer) }
    parser.end()
  })
}

module.exports = {
  process
}
