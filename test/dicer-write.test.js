'use strict'

const { test } = require('tap')
const { Dicer } = require('../lib/main')

test('dicer _write method', t => {
  t.plan(1)

  t.test('calls the callback cb() when headerFirst is set and all the data have been written', t => {
    t.plan(1)
    const dicer = new Dicer({ headerFirst: true })

    dicer._write(Buffer.from('Content-Type: text/plain'), null, () => {
      dicer._write(Buffer.from('Content-Type: text/plain'), null, () => {
        t.pass('write method called')
      })
    })

    t.end()
  })
})
