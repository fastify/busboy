'use strict'

// A special, edited version of the multipart parser from parted is needed here
// because otherwise it attempts to do some things above and beyond just parsing
// -- like saving to disk and whatnot

const Parser = require('./parted-multipart')
const boundary = '-----------------------------168072824752491622650073'
const parser = new Parser('boundary=' + boundary)
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

parser.on('header', function () {
  // callbacks.headerField++;
})

parser.on('data', function () {
  // callbacks.partBegin++;
})

parser.on('part', function () {

})

parser.on('end', function () {
  // callbacks.end++;
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
