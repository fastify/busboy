'use strict'

const { test } = require('tap')
const Decoder = require('../lib/utils/Decoder')

test('Decoder', t => {
  const tests =
  [
    {
      source: ['Hello world'],
      expected: 'Hello world',
      what: 'No encoded bytes'
    },
    {
      source: ['Hello%20world'],
      expected: 'Hello world',
      what: 'One full encoded byte'
    },
    {
      source: ['Hello%20world%21'],
      expected: 'Hello world!',
      what: 'Two full encoded bytes'
    },
    {
      source: ['Hello%', '20world'],
      expected: 'Hello world',
      what: 'One full encoded byte split #1'
    },
    {
      source: ['Hello%2', '0world'],
      expected: 'Hello world',
      what: 'One full encoded byte split #2'
    },
    {
      source: ['Hello%20', 'world'],
      expected: 'Hello world',
      what: 'One full encoded byte (concat)'
    },
    {
      source: ['Hello%2Qworld'],
      expected: 'Hello%2Qworld',
      what: 'Malformed encoded byte #1'
    },
    {
      source: ['Hello%world'],
      expected: 'Hello%world',
      what: 'Malformed encoded byte #2'
    },
    {
      source: ['Hello+world'],
      expected: 'Hello world',
      what: 'Plus to space'
    },
    {
      source: ['Hello+world%21'],
      expected: 'Hello world!',
      what: 'Plus and encoded byte'
    },
    {
      source: ['5%2B5%3D10'],
      expected: '5+5=10',
      what: 'Encoded plus'
    },
    {
      source: ['5+%2B+5+%3D+10'],
      expected: '5 + 5 = 10',
      what: 'Spaces and encoded plus'
    }
  ]
  t.plan(tests.length + 1)

  tests.forEach((v) => {
    t.test(v.what, t => {
      t.plan(1)

      const dec = new Decoder()
      let result = ''
      v.source.forEach(function (s) {
        result += dec.write(s)
      })
      const msg = 'Decoded string mismatch.\n' +
                'Saw: ' + result + '\n' +
                'Expected: ' + v.expected
      t.strictSame(result, v.expected, msg)
    })
  })

  t.test('reset sets internal buffer to undefined', t => {
    t.plan(2)

    const dec = new Decoder()
    dec.write('Hello+world%2')

    t.notSame(dec.buffer, undefined)
    dec.reset()
    t.equal(dec.buffer, undefined)
  })
})
