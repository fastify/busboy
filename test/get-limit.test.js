'use strict'

const getLimit = require('../lib/utils/getLimit')
const { test } = require('tap')

test('Get limit', t => {
  t.plan(2)

  t.test('Correctly resolves limits', t => {
    t.plan(8)
    t.strictSame(getLimit(undefined, 'fieldSize', 1), 1)
    t.strictSame(getLimit(undefined, 'fileSize', Infinity), Infinity)

    t.strictSame(getLimit({}, 'fieldSize', 1), 1)
    t.strictSame(getLimit({}, 'fileSize', Infinity), Infinity)
    t.strictSame(getLimit({ fieldSize: null }, 'fieldSize', 1), 1)
    t.strictSame(getLimit({ fileSize: null }, 'fileSize', Infinity), Infinity)

    t.strictSame(getLimit({ fieldSize: 0 }, 'fieldSize', 1), 0)
    t.strictSame(getLimit({ fileSize: 2 }, 'fileSize', 1), 2)
  })

  t.test('Throws an error on incorrect limits', t => {
    t.plan(2)

    t.throws(function () {
      getLimit({ fieldSize: '1' }, 'fieldSize', 1)
    }, new Error('Limit fieldSize is not a valid number'))

    t.throws(function () {
      getLimit({ fieldSize: NaN }, 'fieldSize', 1)
    }, new Error('Limit fieldSize is not a valid number'))
  })
})
