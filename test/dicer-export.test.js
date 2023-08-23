'use strict'

const { test } = require('tap')
const { Dicer } = require('../lib/main')

test('dicer-export', t => {
  t.plan(2)

  t.test('without new operator a new dicer instance will be initialized', t => {
    t.plan(1)

    t.type(Dicer({
      boundary: '----boundary'
    }), Dicer)
  })

  t.test('with new operator a new dicer instance will be initialized', t => {
    t.plan(1)

    t.type(new Dicer({
      boundary: '----boundary'
    }), Dicer)
  })
})
