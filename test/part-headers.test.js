'use strict'

const Busboy = require('..')

const { test } = require('node:test')

test('field and file events expose the raw part headers', (t, done) => {
  t.plan(8)
  const boundary = '----busboyHeaders'
  const busboy = new Busboy({
    headers: { 'content-type': 'multipart/form-data; boundary=' + boundary }
  })

  busboy.on('field', (name, val, nameTrunc, valTrunc, encoding, mimeType, headers) => {
    t.assert.strictEqual(name, 'text')
    t.assert.strictEqual(mimeType, 'text/plain')
    t.assert.deepStrictEqual(headers['content-type'], ['Text/Plain; charset=UTF-8'])
    t.assert.deepStrictEqual(headers['x-custom'], ['a', 'b'])
  })
  busboy.on('file', (name, stream, filename, encoding, mimeType, headers) => {
    t.assert.strictEqual(mimeType, 'text/plain')
    t.assert.deepStrictEqual(headers['content-type'], ['text/plain;charset=utf-16'])
    t.assert.deepStrictEqual(headers['content-disposition'], ['form-data; name="f"; filename="a.txt"'])
    stream.resume()
  })
  busboy.on('finish', () => {
    t.assert.ok(true)
    done()
  })

  busboy.end([
    '--' + boundary,
    'Content-Disposition: form-data; name="text"',
    'Content-Type: Text/Plain; charset=UTF-8',
    'X-Custom: a',
    'X-Custom: b',
    '',
    'hello',
    '--' + boundary,
    'Content-Disposition: form-data; name="f"; filename="a.txt"',
    'Content-Type: text/plain;charset=utf-16',
    '',
    'data',
    '--' + boundary + '--',
    ''
  ].join('\r\n'))
})