'use strict'

const Busboy = require('../lib/main')
const { test } = require('tap')

test('busboy, emit', t => {
  t.plan(1)

  t.test('returns undefined when the event is called a second time and the busboy was already finished', t => {
    const busboy = new Busboy({ headers: { 'content-type': 'application/x-www-form-urlencoded' } })
    busboy._finished = true
    busboy.emit('finish')

    t.equal(busboy.emit('finish'), undefined)
    t.end()
  })
})
