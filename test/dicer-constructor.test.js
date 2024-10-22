'use strict'

const { test } = require('node:test')
const Dicer = require('../deps/dicer/lib/Dicer')

test('dicer-constructor', async t => {
  t.plan(2)

  await t.test('should throw an Error when no options parameter is supplied to Dicer', t => {
    t.plan(1)

    t.assert.throws(() => new Dicer(), { message: 'Boundary required' })
  })

  await t.test('without new operator a new dicer instance will be initialized', t => {
    t.plan(1)

    t.assert.strictEqual(Dicer({
      boundary: '----boundary'
    }) instanceof Dicer, true)
  })
})
