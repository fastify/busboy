'use strict'

const { PassThrough } = require('stream')
const Busboy = require('../').default
const { test } = require('tap')

test('BusboyFileStream emits limit', t => {
  t.plan(1)

  const bigPayload = Buffer.alloc(20, 'a')
  const boundary = 'foo'
  const req = new PassThrough()
  req.headers = {
    'content-type': `multipart/form-data; boundary=${boundary}`
  }

  const bb = new Busboy({
    headers: req.headers,
    limits: { fileSize: 10 }
  })

  bb.on('file', (_fieldname, stream) => {
    stream.on('limit', () => {
      t.pass('limit event emitted')
    })
    stream.resume()
  })

  req.pipe(bb)

  const delimiter = `--${boundary}`
  req.write(`${delimiter}\r\n`)
  req.write('Content-Disposition: form-data; name="file"; filename="a.txt"\r\n\r\n')
  req.write(bigPayload)
  req.write(`\r\n${delimiter}--\r\n`)
  req.end()
})
