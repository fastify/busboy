'use strict'

const { test } = require('tap')
const basename = require('../lib/utils/basename')

test('basename', (t) => {
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

  testCases.forEach((testCase, index) => {
    t.test(testCase.description, t => {
      t.plan(1)
      t.equal(basename(testCase.path), testCase.expected, `Test case ${index + 1}`)
    })
  })
})
