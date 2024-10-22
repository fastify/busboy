'use strict'

const Busboy = require('../lib/main')
const { test } = require('node:test')

test('busboy, emit', t => {
  t.plan(1)

  t.test('returns undefined when the event is called a second time and the busboy was already finished', t => {
    const busboy = new Busboy({ headers: { 'content-type': 'application/x-www-form-urlencoded' } })
    busboy._finished = true
    busboy.emit('finish')

    t.assert.strictEqual(busboy.emit('finish'), undefined)
  })
})
