'use strict'

const { Bench } = require('tinybench')
const Busboy = require('../index')
const { createMultipartBufferForEncodingBench } = require('./createMultipartBufferForEncodingBench')

const boundary = '-----------------------------168072824752491622650073'

function createBusboyRun (charset) {
  const buffer = createMultipartBufferForEncodingBench(boundary, 100, charset)
  return () => {
    const busboy = new Busboy({
      headers: {
        'content-type': 'multipart/form-data; boundary=' + boundary
      }
    })
    busboy.on('file', (field, file) => { file.resume() })
    busboy.on('error', () => {})
    busboy.write(buffer, () => {})
    busboy.end()
  }
}

const bench = new Bench({ iterations: 1000, warmupIterations: 100 })

bench
  .add('fastify-busboy form (latin1)', createBusboyRun('iso-8859-1'))
  .add('fastify-busboy form (utf-8)', createBusboyRun('utf-8'))
  .run()
  .then(() => {
    console.table(bench.table())
  })
