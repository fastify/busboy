'use strict'

const { test } = require('tap')
const decodeText = require('../lib/utils/decodeText')

test('decodeText', t => {
  const testCases = [
    { description: 'UTF-8 encoding', text: Buffer.from('Hello, World!', 'utf8'), initialCharset: 'utf8', outputCharset: 'utf8', expected: 'Hello, World!' },
    { description: 'UTF-8 encoding empty', text: Buffer.from('', 'utf8'), initialCharset: 'utf8', outputCharset: 'utf8', expected: '' },
    { description: 'Latin1 encoding', text: Buffer.from('Hello, World!', 'latin1'), initialCharset: 'latin1', outputCharset: 'latin1', expected: 'Hello, World!' },
    { description: 'Latin1 encoding empty', text: Buffer.from('', 'latin1'), initialCharset: 'latin1', outputCharset: 'latin1', expected: '' },
    { description: 'UTF-16LE encoding', text: Buffer.from('Hello, World!', 'utf16le'), initialCharset: 'utf16le', outputCharset: 'utf16le', expected: 'Hello, World!' },
    { description: 'UTF-8 to UTF-16LE encoding', text: 'Hello, World!', initialCharset: 'utf16le', outputCharset: 'utf16le', expected: 'Hello, World!' },
    { description: 'UTF-16LE encoding empty', text: Buffer.from('', 'utf16le'), initialCharset: 'utf16le', outputCharset: 'utf16le', expected: '' },
    { description: 'Base64 encoding', text: Buffer.from('Hello, World!').toString('base64'), initialCharset: 'base64', outputCharset: 'base64', expected: 'SGVsbG8sIFdvcmxkIQ==' },
    { description: 'UTF-8 to Base64 encoding', text: 'Hello, World!', initialCharset: 'utf8', outputCharset: 'base64', expected: 'SGVsbG8sIFdvcmxkIQ==' },
    { description: 'Base64 encoding empty', text: Buffer.from('', 'utf8'), initialCharset: 'utf8', outputCharset: 'base64', expected: '' },
    { description: 'UTF8 to base64', text: Buffer.from('Hello, World!', 'utf-8'), initialCharset: 'utf8', outputCharset: 'base64', expected: 'SGVsbG8sIFdvcmxkIQ==' },
    { description: 'Unknown', text: 'Hello, World!', initialCharset: 'utf8', outputCharset: 'other', expected: 'Hello, World!' },
    { description: 'Unknown empty', text: Buffer.from('', 'utf8'), initialCharset: 'utf8', outputCharset: 'other', expected: '' },
    { description: 'Unknown', text: 'Hello, World!', initialCharset: 'utf8', outputCharset: 'utf-8', expected: 'Hello, World!' }
  ]

  t.plan(testCases.length)

  testCases.forEach((c, index) => {
    t.test(c.description, t => {
      t.plan(1)
      t.equal(decodeText(c.text, c.initialCharset, c.outputCharset), c.expected, `Test case ${index + 1}`)
    })
  })
})
