'use strict'

const { test } = require('node:test')
const Dicer = require('../deps/dicer/lib/Dicer')

test('dicer-header-only-part', async t => {
  t.plan(1)

  await t.test('should emit the header and finish when a delimiter ends the header block', async t => {
    t.plan(5)
    const d = new Dicer({ boundary: 'boundary' })
    const headers = []
    let ended = 0

    await new Promise((resolve) => {
      d.on('part', function (p) {
        p.on('header', function (header) {
          headers.push(header)
        })
        p.on('data', function () {
          t.assert.fail('a header-only part has no body')
        })
        p.on('end', function () {
          ++ended
        })
      })
      d.on('finish', function () {
        t.assert.strictEqual(ended, 2)
        t.assert.deepStrictEqual(headers[0]['content-disposition'], ['form-data; name="first"'])
        t.assert.deepStrictEqual(headers[1]['content-disposition'], ['form-data; name="second"'])
        t.assert.deepStrictEqual(headers[1]['x-extra'], ['1'])
        t.assert.ok('finish')
        resolve()
      })

      // Both header blocks end at the delimiter instead of at an empty line.
      d.end(Buffer.from(
        '--boundary\r\nContent-Disposition: form-data; name="first"\r\n' +
        '--boundary\r\nContent-Disposition: form-data; name="second"\r\nX-Extra: 1\r\n' +
        '--boundary--'
      ))
    })
  })
})
