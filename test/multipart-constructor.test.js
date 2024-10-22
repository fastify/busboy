'use strict'

const Multipart = require('../lib/types/multipart')
const Busboy = require('../lib/main')
const { test } = require('node:test')

test('multipart constructor', t => {
  t.plan(1)

  t.test('throws if the boundary is not a string', t => {
    const busboy = new Busboy({ headers: { 'content-type': 'application/x-www-form-urlencoded' } })

    t.assert.throws(() => new Multipart(busboy, { boundary: 123 }), { message: 'Multipart: Boundary not found' })
    t.assert.ok('end')
  })
})
