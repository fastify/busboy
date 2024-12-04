'use strict'

const { test } = require('node:test')
const Streamsearch = require('../deps/streamsearch/sbmh')

test('streamsearch', async t => {
  t.plan(19)

  await t.test('should throw an error if the needle is not a String or Buffer', t => {
    t.plan(1)

    t.assert.throws(() => new Streamsearch(2), { message: 'The needle has to be a String or a Buffer.' })
  })
  await t.test('should throw an error if the needle is an empty String', t => {
    t.plan(1)

    t.assert.throws(() => new Streamsearch(''), { message: 'The needle cannot be an empty String/Buffer.' })
  })
  await t.test('should throw an error if the needle is an empty Buffer', t => {
    t.plan(1)

    t.assert.throws(() => new Streamsearch(Buffer.from('')), { message: 'The needle cannot be an empty String/Buffer.' })
  })
  await t.test('should throw an error if the needle is bigger than 256 characters', t => {
    t.plan(1)

    t.assert.throws(() => new Streamsearch(Buffer.from(Array(257).fill('a').join(''))), { message: 'The needle cannot have a length bigger than 256.' })
  })

  await t.test('should process a Buffer without a needle', t => {
    t.plan(5)
    const expected = [
      [false, Buffer.from('bar hello'), 0, 9]
    ]
    const needle = '\r\n'
    const s = new Streamsearch(needle)
    const chunks = [
      Buffer.from('bar hello')
    ]
    let i = 0
    s.on('info', (isMatched, data, start, end) => {
      t.assert.deepStrictEqual(isMatched, expected[i][0])
      t.assert.deepStrictEqual(data, expected[i][1])
      t.assert.deepStrictEqual(start, expected[i][2])
      t.assert.deepStrictEqual(end, expected[i][3])
      i++
      if (i >= 1) {
        t.assert.ok('pass')
      }
    })

    s.push(chunks[0])
  })

  await t.test('should cast a string without a needle', t => {
    t.plan(5)

    const expected = [
      [false, Buffer.from('bar hello'), 0, 9]
    ]
    const needle = '\r\n'
    const s = new Streamsearch(needle)
    const chunks = [
      'bar hello'
    ]
    let i = 0
    s.on('info', (isMatched, data, start, end) => {
      t.assert.deepStrictEqual(isMatched, expected[i][0])
      t.assert.deepStrictEqual(data, expected[i][1])
      t.assert.deepStrictEqual(start, expected[i][2])
      t.assert.deepStrictEqual(end, expected[i][3])
      i++
      if (i >= 1) {
        t.assert.ok('pass')
      }
    })

    s.push(chunks[0])
  })

  await t.test('should process a chunk with a needle at the beginning', t => {
    t.plan(9)

    const expected = [
      [true, undefined, undefined, undefined],
      [false, Buffer.from('\r\nbar hello'), 2, 11]
    ]
    const needle = '\r\n'
    const s = new Streamsearch(needle)
    const chunks = [
      Buffer.from('\r\nbar hello')
    ]
    let i = 0
    s.on('info', (isMatched, data, start, end) => {
      t.assert.deepStrictEqual(isMatched, expected[i][0])
      t.assert.deepStrictEqual(data, expected[i][1])
      t.assert.deepStrictEqual(start, expected[i][2])
      t.assert.deepStrictEqual(end, expected[i][3])
      i++
      if (i >= 2) {
        t.assert.ok('pass')
      }
    })

    s.push(chunks[0])
  })

  await t.test('should process a chunk with a needle in the middle', t => {
    t.plan(9)
    const expected = [
      [true, Buffer.from('bar\r\n hello'), 0, 3],
      [false, Buffer.from('bar\r\n hello'), 5, 11]
    ]
    const needle = '\r\n'
    const s = new Streamsearch(needle)
    const chunks = [
      Buffer.from('bar\r\n hello')
    ]
    let i = 0
    s.on('info', (isMatched, data, start, end) => {
      t.assert.deepStrictEqual(isMatched, expected[i][0])
      t.assert.deepStrictEqual(data, expected[i][1])
      t.assert.deepStrictEqual(start, expected[i][2])
      t.assert.deepStrictEqual(end, expected[i][3])
      i++
      if (i >= 2) {
        t.assert.ok('pass')
      }
    })

    s.push(chunks[0])
  })

  await t.test('should process a chunk with a needle at the end', t => {
    t.plan(5)
    const expected = [
      [true, Buffer.from('bar hello\r\n'), 0, 9]
    ]
    const needle = '\r\n'
    const s = new Streamsearch(needle)
    const chunks = [
      Buffer.from('bar hello\r\n')
    ]
    let i = 0
    s.on('info', (isMatched, data, start, end) => {
      t.assert.deepStrictEqual(isMatched, expected[i][0])
      t.assert.deepStrictEqual(data, expected[i][1])
      t.assert.deepStrictEqual(start, expected[i][2])
      t.assert.deepStrictEqual(end, expected[i][3])
      i++
      if (i >= 1) {
        t.assert.ok('pass')
      }
    })

    s.push(chunks[0])
  })

  await t.test('should process a chunk with multiple needle at the end', t => {
    t.plan(9)
    const expected = [
      [true, Buffer.from('bar hello\r\n\r\n'), 0, 9],
      [true, Buffer.from('bar hello\r\n\r\n'), 11, 11]
    ]
    const needle = '\r\n'
    const s = new Streamsearch(needle)
    const chunks = [
      Buffer.from('bar hello\r\n\r\n')
    ]
    let i = 0
    s.on('info', (isMatched, data, start, end) => {
      t.assert.deepStrictEqual(isMatched, expected[i][0])
      t.assert.deepStrictEqual(data, expected[i][1])
      t.assert.deepStrictEqual(start, expected[i][2])
      t.assert.deepStrictEqual(end, expected[i][3])
      i++
      if (i >= 2) {
        t.assert.ok('pass')
      }
    })

    s.push(chunks[0])
  })

  await t.test('should process two chunks without a needle', t => {
    t.plan(9)
    const expected = [
      [false, Buffer.from('bar'), 0, 3],
      [false, Buffer.from('hello'), 0, 5]
    ]
    const needle = '\r\n'
    const s = new Streamsearch(needle)
    const chunks = [
      Buffer.from('bar'),
      Buffer.from('hello')
    ]
    let i = 0
    s.on('info', (isMatched, data, start, end) => {
      t.assert.deepStrictEqual(isMatched, expected[i][0])
      t.assert.deepStrictEqual(data, expected[i][1])
      t.assert.deepStrictEqual(start, expected[i][2])
      t.assert.deepStrictEqual(end, expected[i][3])
      i++
      if (i >= 2) {
        t.assert.ok('pass')
      }
    })

    s.push(chunks[0])
    s.push(chunks[1])
  })

  await t.test('should process two chunks with an overflowing needle', t => {
    t.plan(13)
    const expected = [
      [false, Buffer.from('bar\r'), 0, 3],
      [true, undefined, undefined, undefined],
      [false, Buffer.from('\nhello'), 1, 6]
    ]
    const needle = '\r\n'
    const s = new Streamsearch(needle)
    const chunks = [
      Buffer.from('bar\r'),
      Buffer.from('\nhello')
    ]
    let i = 0
    s.on('info', (isMatched, data, start, end) => {
      t.assert.deepStrictEqual(isMatched, expected[i][0])
      t.assert.deepStrictEqual(data, expected[i][1])
      t.assert.deepStrictEqual(start, expected[i][2])
      t.assert.deepStrictEqual(end, expected[i][3])
      i++
      if (i >= 3) {
        t.assert.ok('pass')
      }
    })

    s.push(chunks[0])
    s.push(chunks[1])
  })

  await t.test('should process two chunks with an overflowing needle /2', t => {
    t.plan(9)
    const expected = [
      [false, Buffer.from('t\0\0'), 0, 1],
      [false, Buffer.from('shello'), 0, 7]
    ]
    const needle = 'test'
    const s = new Streamsearch(needle)
    const chunks = [
      Buffer.from('t'),
      Buffer.from('eshello')
    ]
    let i = 0
    s.on('info', (isMatched, data, start, end) => {
      t.assert.deepStrictEqual(isMatched, expected[i][0])
      t.assert.deepStrictEqual(data, expected[i][1])
      t.assert.deepStrictEqual(start, expected[i][2])
      t.assert.deepStrictEqual(end, expected[i][3])
      i++
      if (i >= 2) {
        t.assert.ok('pass')
      }
    })

    s.push(chunks[0])
    s.push(chunks[1])
  })

  await t.test('should process two chunks with a potentially overflowing needle', t => {
    t.plan(13)

    const expected = [
      [false, Buffer.from('bar\r'), 0, 3],
      [false, Buffer.from('\r\0'), 0, 1],
      [false, Buffer.from('\n\r\nhello'), 0, 8]
    ]
    const needle = '\r\n\n'
    const s = new Streamsearch(needle)
    const chunks = [
      Buffer.from('bar\r'),
      Buffer.from('\n\r\nhello')
    ]
    let i = 0
    s.on('info', (isMatched, data, start, end) => {
      t.assert.deepStrictEqual(isMatched, expected[i][0])
      t.assert.deepStrictEqual(data, expected[i][1])
      t.assert.deepStrictEqual(start, expected[i][2])
      t.assert.deepStrictEqual(end, expected[i][3])
      i++
      if (i >= 3) {
        t.assert.ok('pass')
      }
    })

    s.push(chunks[0])
    s.push(chunks[1])
  })

  await t.test('should process three chunks with a overflowing needle', t => {
    t.plan(13)

    const expected = [
      [false, Buffer.from('bar\r'), 0, 3],
      [true, undefined, undefined, undefined],
      [false, Buffer.from('\nhello'), 1, 6]
    ]
    const needle = '\r\n\n'
    const s = new Streamsearch(needle)
    const chunks = [
      Buffer.from('bar\r'),
      Buffer.from('\n'),
      Buffer.from('\nhello')
    ]
    let i = 0
    s.on('info', (isMatched, data, start, end) => {
      t.assert.deepStrictEqual(isMatched, expected[i][0])
      t.assert.deepStrictEqual(data, expected[i][1])
      t.assert.deepStrictEqual(start, expected[i][2])
      t.assert.deepStrictEqual(end, expected[i][3])
      i++
      if (i >= 3) {
        t.assert.ok('pass')
      }
    })

    s.push(chunks[0])
    s.push(chunks[1])
    s.push(chunks[2])
  })

  await t.test('should process four chunks with a overflowing needle', t => {
    t.plan(13)

    const expected = [
      [false, Buffer.from('bar\r'), 0, 3],
      [true, undefined, undefined, undefined],
      [false, Buffer.from('hello'), 0, 5]
    ]
    const needle = '\r\n\n'
    const s = new Streamsearch(needle)
    const chunks = [
      Buffer.from('bar\r'),
      Buffer.from('\n'),
      Buffer.from('\n'),
      Buffer.from('hello')
    ]
    let i = 0
    s.on('info', (isMatched, data, start, end) => {
      t.assert.deepStrictEqual(isMatched, expected[i][0])
      t.assert.deepStrictEqual(data, expected[i][1])
      t.assert.deepStrictEqual(start, expected[i][2])
      t.assert.deepStrictEqual(end, expected[i][3])
      i++
      if (i >= 3) {
        t.assert.ok('pass')
      }
    })

    s.push(chunks[0])
    s.push(chunks[1])
    s.push(chunks[2])
    s.push(chunks[3])
  })

  await t.test('should process four chunks with repeted starting overflowing needle', t => {
    t.plan(13)

    const expected = [
      [false, Buffer.from('\n\n'), 0, 1],
      [true, undefined, undefined, undefined],
      [false, Buffer.from('\r\nhello'), 1, 7]
    ]
    const needle = '\n\n\r'
    const s = new Streamsearch(needle)
    const chunks = [
      Buffer.from('\n'),
      Buffer.from('\n'),
      Buffer.from('\n'),
      Buffer.from('\r\nhello')
    ]
    let i = 0
    s.on('info', (isMatched, data, start, end) => {
      t.assert.deepStrictEqual(isMatched, expected[i][0])
      t.assert.deepStrictEqual(data, expected[i][1])
      t.assert.deepStrictEqual(start, expected[i][2])
      t.assert.deepStrictEqual(end, expected[i][3])
      i++
      if (i >= 3) {
        t.assert.ok('pass')
      }
    })

    s.push(chunks[0])
    s.push(chunks[1])
    s.push(chunks[2])
    s.push(chunks[3])
  })

  await t.test('should process four chunks with a potentially overflowing needle', t => {
    t.plan(17)

    const expected = [
      [false, Buffer.from('bar\r'), 0, 3],
      [false, Buffer.from('\r\n'), 0, 2],
      [false, Buffer.from('\r\n'), 0, 1],
      [false, Buffer.from('hello'), 0, 5]
    ]
    const needle = '\r\n\n'
    const s = new Streamsearch(needle)
    const chunks = [
      Buffer.from('bar\r'),
      Buffer.from('\n'),
      Buffer.from('\r'),
      Buffer.from('hello')
    ]
    let i = 0
    s.on('info', (isMatched, data, start, end) => {
      t.assert.deepStrictEqual(isMatched, expected[i][0])
      t.assert.deepStrictEqual(data, expected[i][1])
      t.assert.deepStrictEqual(start, expected[i][2])
      t.assert.deepStrictEqual(end, expected[i][3])
      i++
      if (i >= 4) {
        t.assert.ok('pass')
      }
    })

    s.push(chunks[0])
    s.push(chunks[1])
    s.push(chunks[2])
    s.push(chunks[3])
  })

  await t.test('should reset the internal values if .reset() is called', t => {
    t.plan(9)

    const s = new Streamsearch('test')

    t.assert.deepStrictEqual(s._lookbehind_size, 0)
    t.assert.deepStrictEqual(s.matches, 0)
    t.assert.deepStrictEqual(s._bufpos, 0)

    s._lookbehind_size = 1
    s._bufpos = 1
    s.matches = 1

    t.assert.deepStrictEqual(s._lookbehind_size, 1)
    t.assert.deepStrictEqual(s.matches, 1)
    t.assert.deepStrictEqual(s._bufpos, 1)

    s.reset()

    t.assert.deepStrictEqual(s._lookbehind_size, 0)
    t.assert.deepStrictEqual(s.matches, 0)
    t.assert.deepStrictEqual(s._bufpos, 0)
  })
})
