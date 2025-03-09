'use strict'

const Dicer = require('../deps/dicer/lib/Dicer')
const { test } = require('node:test')
const fs = require('node:fs')
const path = require('node:path')

const FIXTURES_ROOT = path.join(__dirname, 'fixtures/')

test('dicer-multipart-nolisteners', async t => {
  t.plan(1)

  await t.test('No preamble or part listeners', async t => {
    t.plan(3)
    await new Promise((resolve) => {
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
        t.assert.ok(finishes++ === 0, 'finish emitted multiple times')

        t.assert.ok(error === undefined, `Unexpected error: ${error}`)
        t.assert.ok('pass')
        resolve()
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
})
