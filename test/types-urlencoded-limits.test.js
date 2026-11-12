'use strict'

const { test } = require('node:test')
const Busboy = require('..')

function parse (chunks, limits) {
  return new Promise((resolve, reject) => {
    const busboy = new Busboy({
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      limits
    })
    const fields = []
    let maxKey = 0
    let maxVal = 0

    busboy.on('field', (key, val, keyTrunc, valTrunc) => {
      fields.push([key.length, val.length, keyTrunc, valTrunc])
    })
    busboy.on('error', reject)
    busboy.on('finish', () => resolve({ fields, maxKey, maxVal }))

    for (const chunk of chunks) {
      busboy.write(Buffer.from(chunk))
      maxKey = Math.max(maxKey, busboy._parser._key.length)
      maxVal = Math.max(maxVal, busboy._parser._val.length)
    }
    busboy.end()
  })
}

test('fieldSize is enforced when a malformed escape crosses the limit', async (t) => {
  const { fields } = await parse(['a=' + 'x'.repeat(99) + '%G' + 'x'.repeat(1000)], { fieldSize: 100 })
  t.assert.deepStrictEqual(fields, [[1, 100, false, true]])
})

test('fieldNameSize is enforced when a malformed escape crosses the limit', async (t) => {
  const { fields } = await parse(['x'.repeat(99) + '%G' + 'x'.repeat(1000) + '=a'], { fieldNameSize: 100 })
  t.assert.deepStrictEqual(fields, [[100, 1, true, false]])
})

test('fieldSize is enforced for repeated incomplete escapes', async (t) => {
  const { fields } = await parse(['a=' + '%a%'.repeat(4)], { fieldSize: 4 })
  t.assert.deepStrictEqual(fields, [[1, 4, false, true]])
})

test('fieldSize is enforced for an invalid escape after the limit', async (t) => {
  const { fields } = await parse(['x=aaaaaaa%zz' + 'b'.repeat(1000)], { fieldSize: 8 })
  t.assert.deepStrictEqual(fields, [[1, 8, false, true]])
})

test('default fieldSize and fieldNameSize are enforced for repeated incomplete escapes', async (t) => {
  const value = await parse(['a=' + '%a%'.repeat(600000)])
  t.assert.deepStrictEqual(value.fields, [[1, 1024 * 1024, false, true]])

  const name = await parse(['%a%'.repeat(60) + '=x'])
  t.assert.deepStrictEqual(name.fields, [[100, 1, true, false]])
})

test('the buffered value stays within fieldSize while streaming', async (t) => {
  const chunks = ['a=' + 'x'.repeat(99) + '%G']
  for (let i = 0; i < 10; ++i) { chunks.push('x'.repeat(10000)) }
  chunks.push('&b=ok')

  const { fields, maxVal } = await parse(chunks, { fieldSize: 100 })
  t.assert.ok(maxVal <= 100, 'buffered value length ' + maxVal)
  t.assert.deepStrictEqual(fields, [[1, 100, false, true], [1, 2, false, false]])
})

test('the buffered name stays within fieldNameSize while streaming', async (t) => {
  const chunks = ['x'.repeat(99) + '%G']
  for (let i = 0; i < 10; ++i) { chunks.push('x'.repeat(10000)) }
  chunks.push('=a&b=ok')

  const { fields, maxKey } = await parse(chunks, { fieldNameSize: 100 })
  t.assert.ok(maxKey <= 100, 'buffered name length ' + maxKey)
  t.assert.deepStrictEqual(fields, [[100, 1, true, false], [1, 2, false, false]])
})

test('a zero fieldSize still truncates every value', async (t) => {
  const { fields } = await parse(['a=b&c=%G'], { fieldSize: 0 })
  t.assert.deepStrictEqual(fields, [[1, 0, false, true], [1, 0, false, true]])
})
