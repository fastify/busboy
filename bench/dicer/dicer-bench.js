'use strict'

const { Bench } = require('tinybench')
const Dicer = require('../../deps/dicer/lib/Dicer')

function createMultipartBuffer (boundary, size) {
  const head =
    '--' + boundary + '\r\n' +
    'content-disposition: form-data; name="field1"\r\n' +
    '\r\n'
  const tail = '\r\n--' + boundary + '--\r\n'
  const buffer = Buffer.allocUnsafe(size)
  buffer.write(head, 0, 'ascii')
  buffer.write(tail, buffer.length - tail.length, 'ascii')
  return buffer
}

const boundary = '-----------------------------168072824752491622650073'
const mb = 100
const buffer = createMultipartBuffer(boundary, mb * 1024 * 1024)

const bench = new Bench({ iterations: 10, warmupIterations: 2 })

bench
  .add(`dicer multipart (${mb}MB)`, () => {
    const d = new Dicer({ boundary })
    d.on('part', (p) => {
      p.on('header', () => {})
      p.on('data', () => {})
      p.on('end', () => {})
    })
    d.on('end', () => {})
    d.write(buffer)
  })
  .run()
  .then(() => {
    console.table(bench.table())
  })
