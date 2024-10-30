'use strict'

const { test } = require('node:test')
const { Dicer } = require('../lib/main')

test('dicer-export', async t => {
  t.plan(2)

  await t.test('without new operator a new dicer instance will be initialized', t => {
    t.plan(1)

    t.assert.strictEqual(Dicer({
      boundary: '----boundary'
    }) instanceof Dicer, true)
  })

  await t.test('with new operator a new dicer instance will be initialized', t => {
    t.plan(1)

    t.assert.strictEqual(new Dicer({
      boundary: '----boundary'
    }) instanceof Dicer, true)
  })
})
