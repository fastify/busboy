'use strict'

const { test } = require('node:test')
const HeaderParser = require('../deps/dicer/lib/HeaderParser')
const Busboy = require('..')

function parseHeader (chunks, maxHeaderSize) {
  const hp = new HeaderParser({ maxHeaderSize })
  let result
  hp.on('header', (header) => { result = header })
  for (const chunk of chunks) {
    hp.push(Buffer.from(chunk, 'latin1'))
  }
  return result
}

test('split header terminator is removed when it fills maxHeaderSize', (t) => {
  t.assert.deepStrictEqual({ ...parseHeader(['Foo: bar\r', '\n\r\n'], 9) }, { foo: ['bar'] })
  t.assert.deepStrictEqual({ ...parseHeader(['Foo: bar\r\n', '\r\n'], 10) }, { foo: ['bar'] })
  t.assert.deepStrictEqual({ ...parseHeader(['Foo: bar\r\n', '\r\n'], 9) }, { foo: ['bar'] })
  t.assert.deepStrictEqual({ ...parseHeader(['Foo: bar\r\n\r', '\n'], 10) }, { foo: ['bar'] })
  t.assert.deepStrictEqual({ ...parseHeader(['Foo: bar\r', '\n', '\r', '\n'], 9) }, { foo: ['bar'] })
})

test('header parsing does not depend on chunking around maxHeaderSize', (t) => {
  const header = 'A: 1\r\nB: 2\r\nContent-Type: application/octet-stream'
  const source = header + '\r\n\r\n'

  for (let maxHeaderSize = header.length - 4; maxHeaderSize <= source.length + 1; ++maxHeaderSize) {
    const expected = { ...parseHeader([source], maxHeaderSize) }
    for (let i = 1; i < source.length; ++i) {
      for (let j = i; j < source.length; ++j) {
        const chunks = [source.slice(0, i), source.slice(i, j), source.slice(j)].filter((c) => c.length)
        t.assert.deepStrictEqual({ ...parseHeader(chunks, maxHeaderSize) }, expected,
          'maxHeaderSize=' + maxHeaderSize + ' chunks=' + JSON.stringify(chunks))
      }
    }
  }
})

test('file part is not reclassified as a field when the header terminator is split at the headerSize limit', async (t) => {
  // With the default 80 KiB headerSize, this padding puts the first CR of the
  // header terminator exactly on the limit when it arrives in its own write.
  const pre = '--b\r\n' +
    'X-Pad: ' + 'a'.repeat(81823) + '\r\n' +
    'Content-Disposition: form-data; name="upload"\r\n' +
    'Content-Type: application/octet-stream'
  const body = Buffer.from(pre + '\r\n\r\nDATA\r\n--b--\r\n', 'latin1')

  function parse (splitAt) {
    return new Promise((resolve, reject) => {
      const busboy = new Busboy({ headers: { 'content-type': 'multipart/form-data; boundary=b' } })
      const events = []
      busboy.on('file', (name, stream, filename, encoding, mimeType) => {
        events.push(['file', name, mimeType])
        stream.resume()
      })
      busboy.on('field', (name, value, nameTrunc, valTrunc, encoding, mimeType) => {
        events.push(['field', name, mimeType])
      })
      busboy.on('error', reject)
      busboy.on('finish', () => resolve(events))
      if (splitAt === undefined) {
        busboy.end(body)
      } else {
        busboy.write(body.subarray(0, splitAt))
        busboy.end(body.subarray(splitAt))
      }
    })
  }

  const expected = [['file', 'upload', 'application/octet-stream']]
  t.assert.deepStrictEqual(await parse(), expected)
  for (let k = 0; k <= 4; ++k) {
    t.assert.deepStrictEqual(await parse(pre.length + k), expected, 'split at terminator offset ' + k)
  }
})
