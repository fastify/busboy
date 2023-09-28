'use strict'

const Dicer = require('../deps/dicer/lib/Dicer')
const { test } = require('tap')
const fs = require('fs')
const path = require('path')

const FIXTURES_ROOT = path.join(__dirname, 'fixtures/')

test('dicer-multipart-nolisteners', t => {
  t.plan(1)

  t.test('No preamble or part listeners', t => {
    t.plan(3)
    const fixtureBase = path.resolve(FIXTURES_ROOT, 'many')
    let n = 0
    const buffer = Buffer.allocUnsafe(16)

    const fd = fs.openSync(fixtureBase + '/original', 'r')

    const dicer = new Dicer({ boundary: '----WebKitFormBoundaryWLHCs9qmcJJoyjKR' })
    let error
    let finishes = 0

    dicer.on('error', function (err) {
      error = err
    }).on('finish', function () {
      t.ok(finishes++ === 0, 'finish emitted multiple times')

      t.ok(error === undefined, `Unexpected error: ${error}`)
      t.pass()
    })

    while (true) {
      n = fs.readSync(fd, buffer, 0, buffer.length, null)
      if (n === 0) {
        dicer.end()
        break
      }
      dicer.write(n === buffer.length ? buffer : buffer.slice(0, n))
    }
    fs.closeSync(fd)
  })
})
