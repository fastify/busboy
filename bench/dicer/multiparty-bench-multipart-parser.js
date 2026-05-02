'use strict'

const assert = require('node:assert')
const Form = require('multiparty').Form
const boundary = '-----------------------------168072824752491622650073'
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

const form = new Form({ boundary })

hijack('onParseHeaderField', function () {
  callbacks.headerField++
})

hijack('onParseHeaderValue', function () {
  callbacks.headerValue++
})

hijack('onParsePartBegin', function () {
  callbacks.partBegin++
})

hijack('onParsePartData', function () {
  callbacks.partData++
})

hijack('onParsePartEnd', function () {
  callbacks.partEnd++
})

form.on('finish', function () {
  callbacks.end++
})

const start = new Date()
form.write(buffer, function (err) {
  const duration = new Date() - start
  assert.ifError(err)
  const mbPerSec = (mb / (duration / 1000)).toFixed(2)
  console.log(mbPerSec + ' mb/sec')
})

// assert.equal(nparsed, buffer.length);

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

function hijack (name, fn) {
  const oldFn = form[name]
  form[name] = function () {
    fn()
    return oldFn.apply(this, arguments)
  }
}
