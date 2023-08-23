'use strict'

const { test } = require('tap')
const Dicer = require('../deps/dicer/lib/Dicer')

test('dicer-constructor', t => {
  t.plan(2)

  t.test('should throw an Error when no options parameter is supplied to Dicer', t => {
    t.plan(1)

    t.throws(() => new Dicer(), new Error('Boundary required'))
  })

  t.test('without new operator a new dicer instance will be initialized', t => {
    t.plan(1)

    t.type(Dicer({
      boundary: '----boundary'
    }), Dicer)
  })
})
