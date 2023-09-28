'use strict'

const { test } = require('tap')
const Dicer = require('../deps/dicer/lib/Dicer')

test('dicer-malformed-header', t => {
  t.plan(1)

  t.test('should gracefully handle headers with leading whitespace', t => {
    t.plan(3)
    const d = new Dicer({ boundary: '----WebKitFormBoundaryoo6vortfDzBsDiro' })

    d.on('part', function (p) {
      p.on('header', function (header) {
        t.hasProp(header, ' content-disposition')
        t.strictSame(header[' content-disposition'], ['form-data; name="bildbeschreibung"'])
      })
      p.on('data', function (data) {
      })
      p.on('end', function () {
      })
    })
    d.on('finish', function () {
      t.pass()
    })

    d.write(Buffer.from('------WebKitFormBoundaryoo6vortfDzBsDiro\r\n Content-Disposition: form-data; name="bildbeschreibung"\r\n\r\n\r\n------WebKitFormBoundaryoo6vortfDzBsDiro--'))
  })
})
