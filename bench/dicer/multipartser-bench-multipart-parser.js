'use strict'

/* eslint-disable */
const multipartser = require('multipartser')
const boundary = '-----------------------------168072824752491622650073'
const parser = multipartser()
const mb = 100
const buffer = createMultipartBuffer(boundary, mb * 1024 * 1024)
const callbacks =
      {
        partBegin: -1,
        partEnd: -1,
        headerField: -1,
        headerValue: -1,
        partData: -1,
        end: -1,
      }

parser.boundary(boundary)

parser.on('part', function (part) {
})

parser.on('end', function () {
  // console.log( 'completed parsing' );
})

parser.on('error', function (error) {
  console.error(error)
})

const start = +new Date()
const duration = +new Date() - start
const mbPerSec = (mb / (duration / 1000)).toFixed(2)

console.log(mbPerSec + ' mb/sec')

function createMultipartBuffer (boundary, size) {
  const head =
        '--' + boundary + '\r\n' +
      'content-disposition: form-data; name="field1"\r\n' +
      '\r\n'
  const tail = '\r\n--' + boundary + '--\r\n'
  const buffer = Buffer.allocUnsafe(size)

  buffer.write(head, 'ascii', 0)
  buffer.write(tail, 'ascii', buffer.length - tail.length)
  return buffer
}

process.on('exit', function () {
  /* for (var k in callbacks) {
    assert.equal(0, callbacks[k], k+' count off by '+callbacks[k]);
  } */
})
