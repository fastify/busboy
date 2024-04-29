'use strict'

const { inspect } = require('util')
const Busboy = require('..')
const { test } = require('tap')

const EMPTY_FN = function () {
}

const tests = [
  {
    source: ['foo'],
    expected: [['foo', '', false, false]],
    what: 'Unassigned value',
    plan: 4
  },
  {
    source: ['foo=bar'],
    expected: [['foo', 'bar', false, false]],
    what: 'Assigned value',
    plan: 4
  },
  {
    source: ['foo&bar=baz'],
    expected: [['foo', '', false, false],
      ['bar', 'baz', false, false]],
    what: 'Unassigned and assigned value',
    plan: 5
  },
  {
    source: ['foo&baz=bla'],
    expected: [['foo', '', false, false]],
    what: 'Unassigned and assigned value with limit',
    limits: { fields: 1 },
    plan: 4
  },
  {
    source: ['foo=bar&baz'],
    expected: [['foo', 'bar', false, false],
      ['baz', '', false, false]],
    what: 'Assigned and unassigned value',
    plan: 5
  },
  {
    source: ['foo=bar&baz=bla'],
    expected: [['foo', 'bar', false, false],
      ['baz', 'bla', false, false]],
    what: 'Two assigned values',
    plan: 5
  },
  {
    source: ['foo&bar'],
    expected: [['foo', '', false, false],
      ['bar', '', false, false]],
    what: 'Two unassigned values',
    plan: 5
  },
  {
    source: ['foo&bar&'],
    expected: [['foo', '', false, false],
      ['bar', '', false, false]],
    what: 'Two unassigned values and ampersand',
    plan: 5
  },
  {
    source: ['foo=bar+baz%2Bquux'],
    expected: [['foo', 'bar baz+quux', false, false]],
    what: 'Assigned value with (plus) space',
    plan: 4
  },
  {
    source: ['foo=bar%20baz%21'],
    expected: [['foo', 'bar baz!', false, false]],
    what: 'Assigned value with encoded bytes',
    plan: 4
  },
  {
    source: ['foo%20bar=baz%20bla%21'],
    expected: [['foo bar', 'baz bla!', false, false]],
    what: 'Assigned value with encoded bytes #2',
    plan: 4
  },
  {
    source: ['foo=bar%20baz%21&num=1000'],
    expected: [['foo', 'bar baz!', false, false],
      ['num', '1000', false, false]],
    what: 'Two assigned values, one with encoded bytes',
    plan: 5
  },
  {
    source: ['foo=bar&baz=bla', 'foo=bar'],
    expected: [],
    what: 'Exceeded limits',
    limits: { fields: 0 },
    plan: 3
  },
  {
    source: ['foo=bar&baz=bla'],
    expected: [],
    what: 'Limits: zero fields',
    limits: { fields: 0 },
    plan: 3
  },
  {
    source: ['foo=bar&baz=bla'],
    expected: [['foo', 'bar', false, false]],
    what: 'Limits: one field',
    limits: { fields: 1 },
    plan: 4
  },
  {
    source: ['foo=bar&baz=bla'],
    expected: [['foo', 'bar', false, false],
      ['baz', 'bla', false, false]],
    what: 'Limits: field part lengths match limits',
    limits: { fieldNameSize: 3, fieldSize: 3 },
    plan: 5
  },
  {
    source: ['foo=bar&baz=bla'],
    expected: [['fo', 'bar', true, false],
      ['ba', 'bla', true, false]],
    what: 'Limits: truncated field name',
    limits: { fieldNameSize: 2 },
    plan: 5
  },
  {
    source: ['f%20=bar&baz=bla'],
    expected: [['f ', 'bar', false, false],
      ['ba', 'bla', true, false]],
    what: 'Limits: truncated field name with encoded bytes',
    limits: { fieldNameSize: 2 },
    plan: 5
  },
  {
    source: ['foo=b%20&baz=bla'],
    expected: [['foo', 'b ', false, false],
      ['baz', 'bl', false, true]],
    what: 'Limits: truncated field value with encoded bytes',
    limits: { fieldSize: 2 },
    plan: 5
  },
  {
    source: ['foo=bar&baz=bla'],
    expected: [['foo', 'ba', false, true],
      ['baz', 'bl', false, true]],
    what: 'Limits: truncated field value',
    limits: { fieldSize: 2 },
    plan: 5
  },
  {
    source: ['foo=bar&baz=bla'],
    expected: [['fo', 'ba', true, true],
      ['ba', 'bl', true, true]],
    what: 'Limits: truncated field name and value',
    limits: { fieldNameSize: 2, fieldSize: 2 },
    plan: 5
  },
  {
    source: ['foo=bar&baz=bla'],
    expected: [['fo', '', true, true],
      ['ba', '', true, true]],
    what: 'Limits: truncated field name and zero value limit',
    limits: { fieldNameSize: 2, fieldSize: 0 },
    plan: 5
  },
  {
    source: ['foo=bar&baz=bla'],
    expected: [['', '', true, true],
      ['', '', true, true]],
    what: 'Limits: truncated zero field name and zero value limit',
    limits: { fieldNameSize: 0, fieldSize: 0 },
    plan: 5
  },
  {
    source: ['&'],
    expected: [],
    what: 'Ampersand',
    plan: 3
  },
  {
    source: ['&&&&&'],
    expected: [],
    what: 'Many ampersands',
    plan: 3
  },
  {
    source: ['='],
    expected: [['', '', false, false]],
    what: 'Assigned value, empty name and value',
    plan: 4
  },
  {
    source: [''],
    expected: [],
    what: 'Nothing',
    plan: 3
  }
]

tests.forEach((v) => {
  test(v.what, t => {
    t.plan(v.plan || 20)
    const busboy = new Busboy({
      limits: v.limits,
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=utf-8'
      }
    })
    let finishes = 0
    const results = []

    busboy.on('field', function (key, val, keyTrunc, valTrunc) {
      results.push([key, val, keyTrunc, valTrunc])
    })
    busboy.on('file', function () {
      throw new Error('Unexpected file')
    })
    busboy.on('finish', function () {
      t.ok(finishes++ === 0, 'finish emitted multiple times')
      t.equal(results.length, v.expected.length)

      let i = 0
      results.forEach(function (result) {
        t.strictSame(result,
          v.expected[i],
          'Result mismatch:\nParsed: ' + inspect(result) +
                        '\nExpected: ' + inspect(v.expected[i])
        )
        ++i
      })
      t.pass()
    })

    v.source.forEach(function (s) {
      busboy.write(Buffer.from(s, 'utf8'), EMPTY_FN)
    })
    busboy.end()
  })
})

test('Call parser end twice', t => {
  t.plan(1)

  let finishes = 0
  const busboy = new Busboy({
    headers: {
      'content-type': 'application/x-www-form-urlencoded; charset=utf-8'
    }
  })

  busboy.on('finish', function () {
    t.ok(++finishes === 1, 'finish emitted')
  })

  busboy.write(Buffer.from('Hello world', 'utf8'), EMPTY_FN)

  busboy._parser.end()
  busboy._parser.end()
})

test('Call emit finish twice', t => {
  t.plan(2)

  let fields = 0
  let finishes = 0
  
  const busboy = new Busboy({
    headers: {
      'content-type': 'application/x-www-form-urlencoded; charset=utf-8'
    }
  })
  busboy.on('field', function () {
    t.ok(++fields === 1, 'field emitted')
  })

  busboy.on('finish', function () {
    t.ok(++finishes === 1, 'finish emitted')
  })

  busboy.write(Buffer.from('Hello world', 'utf8'), EMPTY_FN)

  busboy.emit('finish');
  busboy.emit('finish');
})