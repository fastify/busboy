'use strict'

const { test } = require('tap')
const Dicer = require('../deps/dicer/lib/Dicer')
const fs = require('fs')
const path = require('path')

const FIXTURES_ROOT = path.join(__dirname, 'fixtures/')

test('dicer-multipart-extra-trailer', t => {
  t.plan(1)

  t.test('Extra trailer data pushed after finished', t => {
    t.plan(5)
    const fixtureBase = FIXTURES_ROOT + 'many'
    let n = 0
    const buffer = Buffer.allocUnsafe(16)
    const state = { parts: [] }

    const fd = fs.openSync(fixtureBase + '/original', 'r')

    const dicer = new Dicer({ boundary: '----WebKitFormBoundaryWLHCs9qmcJJoyjKR' })
    let error
    let finishes = 0
    let trailerEmitted = false

    dicer.on('part', function (p) {
      const part = {
        body: undefined,
        bodylen: 0,
        error: undefined,
        header: undefined
      }

      p.on('header', function (h) {
        part.header = h
      }).on('data', function (data) {
        // make a copy because we are using readSync which re-uses a buffer ...
        const copy = Buffer.allocUnsafe(data.length)
        data.copy(copy)
        data = copy
        if (!part.body) { part.body = [data] } else { part.body.push(data) }
        part.bodylen += data.length
      }).on('error', function (err) {
        part.error = err
        t.fail()
      }).on('end', function () {
        if (part.body) { part.body = Buffer.concat(part.body, part.bodylen) }
        state.parts.push(part)
      })
    }).on('error', function (err) {
      error = err
    }).on('trailer', function (data) {
      trailerEmitted = true
      t.equal(data.toString(), 'Extra', 'trailer should contain the extra data')
    }).on('finish', function () {
      t.ok(finishes++ === 0, makeMsg('Extra trailer data pushed after finished', 'finish emitted multiple times'))
      t.ok(trailerEmitted, makeMsg('Extra trailer data pushed after finished', 'should have emitted trailer'))

      t.ok(error === undefined, makeMsg('Extra trailer data pushed after finished', 'Unexpected error'))

      t.pass()
    })

    while (true) {
      n = fs.readSync(fd, buffer, 0, buffer.length, null)
      if (n === 0) {
        setTimeout(function () {
          dicer.write('\r\n\r\n\r\n')
          dicer.end()
        }, 50)
        break
      }
      dicer.write(n === buffer.length ? buffer : buffer.slice(0, n))
    }
    fs.closeSync(fd)
  })
})

function makeMsg (what, msg) {
  return what + ': ' + msg
}
