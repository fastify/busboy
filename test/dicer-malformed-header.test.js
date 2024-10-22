'use strict'

const { test } = require('node:test')
const Dicer = require('../deps/dicer/lib/Dicer')

test('dicer-malformed-header', async t => {
  t.plan(1)

  await t.test('should gracefully handle headers with leading whitespace', async t => {
    t.plan(3)
    const d = new Dicer({ boundary: '----WebKitFormBoundaryoo6vortfDzBsDiro' })

    await new Promise((resolve) => {
      d.on('part', function (p) {
        p.on('header', function (header) {
          t.assert.ok(header[' content-disposition'])
          t.assert.deepStrictEqual(header[' content-disposition'], ['form-data; name="bildbeschreibung"'])
        })
        p.on('data', function (data) {
        })
        p.on('end', function () {
        })
      })
      d.on('finish', function () {
        t.assert.ok('finish')
        resolve()
      })

      d.write(Buffer.from('------WebKitFormBoundaryoo6vortfDzBsDiro\r\n Content-Disposition: form-data; name="bildbeschreibung"\r\n\r\n\r\n------WebKitFormBoundaryoo6vortfDzBsDiro--'))
    })
  })
})
