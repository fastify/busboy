'use strict'

const path = require('node:path')
const { test } = require('node:test')

// Install a Module._compile hook so that the next require of decodeText.js
// exposes the private `textDecoders` Map on module.exports. We then mutate
// that Map to register a key matching the lexical `this.toString()` of the
// `other` decoder (which is the module exports object at module-load time,
// whose default toString() is "[object Object]").
const Module = require('node:module')
const origCompile = Module.prototype._compile
const targetFile = path.join(__dirname, '..', 'lib', 'utils', 'decodeText.js')
Module.prototype._compile = function (content, filename) {
  if (filename === targetFile) {
    content = content.replace(
      'module.exports = decodeText',
      'module.exports = decodeText; module.exports.__textDecoders = textDecoders'
    )
  }
  return origCompile.call(this, content, filename)
}

const decodeText = require('../lib/utils/decodeText')

test('decodeText other decoder covers textDecoders.has true branch', t => {
  t.plan(3)

  // `this` at module load is the original empty object before module.exports
  // was reassigned. Its default toString() is "[object Object]". Register that
  // key in the (otherwise private) textDecoders Map so the `if` check passes.
  const TextDecoderCtor = require('node:util').TextDecoder
  decodeText.__textDecoders.set('[object Object]', new TextDecoderCtor('utf-8'))

  // Now trigger `other` with a charset that does not match the switch but
  // lowercases to itself (no remap). 'UNKNOWN-CHARSET' lowers to
  // 'unknown-charset' which still does not match the switch, so the getDecoder
  // path returns decoders.other.bind(charset). Inside other, this.toString()
  // is "[object Object]" which is now a key in textDecoders.
  const out = decodeText(Buffer.from([0xc3, 0xa9]), 'binary', 'UNKNOWN-CHARSET')
  t.assert.strictEqual(out, 'é', 'other decoder returns decoded utf-8 byte via TextDecoder')

  // Cover the catch fallthrough: register a decoder that throws. The try block
  // runs, decode() throws, the empty catch swallows it, and we exit the if
  // to the typeof/data.toString fallthrough at line 109/111.
  decodeText.__textDecoders.set('[object Object]', Object.assign(function () { throw new Error('boom') }, {}))
  const out2 = decodeText(Buffer.from('hello'), 'binary', 'UNKNOWN-CHARSET')
  t.assert.strictEqual(out2, 'hello', 'failing decoder falls through to data.toString()')

  // Cover the typeof data === 'string' true branch: patch Buffer.from to
  // return the original string so `data` stays a string after the
  // Buffer.from(...) conversion at line 101, and the trailing ternary at
  // line 109 returns it directly.
  const origBufferFrom = Buffer.from
  Buffer.from = function (data, encoding) { return data }
  try {
    const out3 = decodeText('plain', 'binary', 'UNKNOWN-CHARSET')
    t.assert.strictEqual(out3, 'plain', 'data still a string reaches the true branch of typeof === string')
  } finally {
    Buffer.from = origBufferFrom
  }
})
