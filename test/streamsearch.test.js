'use strict'

const { test } = require('tap')
const Streamsearch = require('../deps/streamsearch/sbmh')

test('streamsearch', t => {
  t.plan(17)

  t.test('should throw an error if the needle is not a String or Buffer', t => {
    t.plan(1)

    t.throws(() => new Streamsearch(2), new Error('The needle has to be a String or a Buffer.'))
  })
  t.test('should throw an error if the needle is an empty String', t => {
    t.plan(1)

    t.throws(() => new Streamsearch(''), new Error('The needle cannot be an empty String/Buffer.'))
  })
  t.test('should throw an error if the needle is an empty Buffer', t => {
    t.plan(1)

    t.throws(() => new Streamsearch(Buffer.from('')), new Error('The needle cannot be an empty String/Buffer.'))
  })
  t.test('should throw an error if the needle is bigger than 256 characters', t => {
    t.plan(1)

    t.throws(() => new Streamsearch(Buffer.from(Array(257).fill('a').join(''))), new Error('The needle cannot have a length bigger than 256.'))
  })

  t.test('should process a Buffer without a needle', t => {
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
      t.strictSame(isMatched, expected[i][0])
      t.strictSame(data, expected[i][1])
      t.strictSame(start, expected[i][2])
      t.strictSame(end, expected[i][3])
      i++
      if (i >= 1) {
        t.pass()
      }
    })

    s.push(chunks[0])
  })

  t.test('should cast a string without a needle', t => {
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
      t.strictSame(isMatched, expected[i][0])
      t.strictSame(data, expected[i][1])
      t.strictSame(start, expected[i][2])
      t.strictSame(end, expected[i][3])
      i++
      if (i >= 1) {
        t.pass()
      }
    })

    s.push(chunks[0])
  })

  t.test('should process a chunk with a needle at the beginning', t => {
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
      t.strictSame(isMatched, expected[i][0])
      t.strictSame(data, expected[i][1])
      t.strictSame(start, expected[i][2])
      t.strictSame(end, expected[i][3])
      i++
      if (i >= 2) {
        t.pass()
      }
    })

    s.push(chunks[0])
  })

  t.test('should process a chunk with a needle in the middle', t => {
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
      t.strictSame(isMatched, expected[i][0])
      t.strictSame(data, expected[i][1])
      t.strictSame(start, expected[i][2])
      t.strictSame(end, expected[i][3])
      i++
      if (i >= 2) {
        t.pass()
      }
    })

    s.push(chunks[0])
  })

  t.test('should process a chunk with a needle at the end', t => {
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
      t.strictSame(isMatched, expected[i][0])
      t.strictSame(data, expected[i][1])
      t.strictSame(start, expected[i][2])
      t.strictSame(end, expected[i][3])
      i++
      if (i >= 1) {
        t.pass()
      }
    })

    s.push(chunks[0])
  })

  t.test('should process a chunk with multiple needle at the end', t => {
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
      t.strictSame(isMatched, expected[i][0])
      t.strictSame(data, expected[i][1])
      t.strictSame(start, expected[i][2])
      t.strictSame(end, expected[i][3])
      i++
      if (i >= 2) {
        t.pass()
      }
    })

    s.push(chunks[0])
  })

  t.test('should process two chunks without a needle', t => {
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
      t.strictSame(isMatched, expected[i][0])
      t.strictSame(data, expected[i][1])
      t.strictSame(start, expected[i][2])
      t.strictSame(end, expected[i][3])
      i++
      if (i >= 2) {
        t.pass()
      }
    })

    s.push(chunks[0])
    s.push(chunks[1])
  })

  t.test('should process two chunks with an overflowing needle', t => {
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
      t.strictSame(isMatched, expected[i][0])
      t.strictSame(data, expected[i][1])
      t.strictSame(start, expected[i][2])
      t.strictSame(end, expected[i][3])
      i++
      if (i >= 3) {
        t.pass()
      }
    })

    s.push(chunks[0])
    s.push(chunks[1])
  })

  t.test('should process two chunks with a potentially overflowing needle', t => {
    t.plan(13)

    const expected = [
      [false, Buffer.from('bar\r'), 0, 3],
      [false, Buffer.from('\r\0\0'), 0, 1],
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
      t.strictSame(isMatched, expected[i][0])
      t.strictSame(data, expected[i][1])
      t.strictSame(start, expected[i][2])
      t.strictSame(end, expected[i][3])
      i++
      if (i >= 3) {
        t.pass()
      }
    })

    s.push(chunks[0])
    s.push(chunks[1])
  })

  t.test('should process three chunks with a overflowing needle', t => {
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
      t.strictSame(isMatched, expected[i][0])
      t.strictSame(data, expected[i][1])
      t.strictSame(start, expected[i][2])
      t.strictSame(end, expected[i][3])
      i++
      if (i >= 3) {
        t.pass()
      }
    })

    s.push(chunks[0])
    s.push(chunks[1])
    s.push(chunks[2])
  })

  t.test('should process four chunks with a overflowing needle', t => {
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
      t.strictSame(isMatched, expected[i][0])
      t.strictSame(data, expected[i][1])
      t.strictSame(start, expected[i][2])
      t.strictSame(end, expected[i][3])
      i++
      if (i >= 3) {
        t.pass()
      }
    })

    s.push(chunks[0])
    s.push(chunks[1])
    s.push(chunks[2])
    s.push(chunks[3])
  })

  t.test('should process four chunks with a potentially overflowing needle', t => {
    t.plan(17)

    const expected = [
      [false, Buffer.from('bar\r'), 0, 3],
      [false, Buffer.from('\r\n\0'), 0, 2],
      [false, Buffer.from('\r\n\0'), 0, 1],
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
      t.strictSame(isMatched, expected[i][0])
      t.strictSame(data, expected[i][1])
      t.strictSame(start, expected[i][2])
      t.strictSame(end, expected[i][3])
      i++
      if (i >= 4) {
        t.pass()
      }
    })

    s.push(chunks[0])
    s.push(chunks[1])
    s.push(chunks[2])
    s.push(chunks[3])
  })

  t.test('should reset the internal values if .reset() is called', t => {
    t.plan(9)

    const s = new Streamsearch('test')

    t.strictSame(s._lookbehind_size, 0)
    t.strictSame(s.matches, 0)
    t.strictSame(s._bufpos, 0)

    s._lookbehind_size = 1
    s._bufpos = 1
    s.matches = 1

    t.strictSame(s._lookbehind_size, 1)
    t.strictSame(s.matches, 1)
    t.strictSame(s._bufpos, 1)

    s.reset()

    t.strictSame(s._lookbehind_size, 0)
    t.strictSame(s.matches, 0)
    t.strictSame(s._bufpos, 0)
  })
})
