'use strict'

const getLimit = require('../lib/utils/getLimit')
const { test } = require('node:test')

test('Get limit', async t => {
  t.plan(2)

  await t.test('Correctly resolves limits', t => {
    t.plan(8)
    t.assert.deepStrictEqual(getLimit(undefined, 'fieldSize', 1), 1)
    t.assert.deepStrictEqual(getLimit(undefined, 'fileSize', Infinity), Infinity)

    t.assert.deepStrictEqual(getLimit({}, 'fieldSize', 1), 1)
    t.assert.deepStrictEqual(getLimit({}, 'fileSize', Infinity), Infinity)
    t.assert.deepStrictEqual(getLimit({ fieldSize: null }, 'fieldSize', 1), 1)
    t.assert.deepStrictEqual(getLimit({ fileSize: null }, 'fileSize', Infinity), Infinity)

    t.assert.deepStrictEqual(getLimit({ fieldSize: 0 }, 'fieldSize', 1), 0)
    t.assert.deepStrictEqual(getLimit({ fileSize: 2 }, 'fileSize', 1), 2)
  })

  await t.test('Throws an error on incorrect limits', t => {
    t.plan(2)

    t.assert.throws(function () {
      getLimit({ fieldSize: '1' }, 'fieldSize', 1)
    }, { message: 'Limit fieldSize is not a valid number' })

    t.assert.throws(function () {
      getLimit({ fieldSize: NaN }, 'fieldSize', 1)
    }, { message: 'Limit fieldSize is not a valid number' })
  })
})
