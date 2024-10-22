'use strict'

const { test } = require('node:test')
const basename = require('../lib/utils/basename')

test('basename', async (t) => {
  const testCases = [
    { description: 'returns an empty string if the path is not a string', path: {}, expected: '' },
    { description: 'returns an empty string if the path includes a \' and the char after is a .', path: 'path\\.', expected: '' },
    { description: 'returns an empty string if the path includes a / and the char after is a .', path: 'path/.', expected: '' },
    { description: 'returns an empty string if the path includes a \' and the chars after are a ..', path: 'path\\..', expected: '' },
    { description: 'returns an empty string if the path includes a / and the chars after are a ..', path: 'path/..', expected: '' },
    { description: 'returns the path if the path includes a \' and the rest is anything other than dots', path: 'path\\subpath', expected: 'subpath' },
    { description: 'returns the path if the path includes a / and the rest is anything other than dots', path: 'path/subpath', expected: 'subpath' },
    { description: 'returns an empty string if the path is a .', path: '.', expected: '' },
    { description: 'returns an empty string if the path is a ..', path: '..', expected: '' },
    { description: 'returns the path if the path is anything other than dots', path: 'subpath', expected: 'subpath' }
  ]

  t.plan(testCases.length)

  const index = 0
  for (const testCase of testCases) {
    await t.test(testCase.description, t => {
      t.plan(1)
      t.assert.strictEqual(basename(testCase.path), testCase.expected, `Test case ${index + 1}`)
    })
  }
})
