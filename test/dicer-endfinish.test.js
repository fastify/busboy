'use strict'

const Dicer = require('../deps/dicer/lib/Dicer')
const { test } = require('node:test')

test('dicer-endfinish', async t => {
  t.plan(1)

  await t.test('should properly handle finish', async t => {
    t.plan(4)

    await new Promise(resolve => {
      const CRLF = '\r\n'
      const boundary = 'boundary'

      const writeSep = '--' + boundary

      const writePart = [
        writeSep,
        'Content-Type:   text/plain',
        'Content-Length: 0'
      ].join(CRLF) +
      CRLF + CRLF +
      'some data' + CRLF

      const writeEnd = '--' + CRLF

      let firedEnd = false
      let firedFinish = false

      const dicer = new Dicer({ boundary })
      dicer.on('part', partListener)
      dicer.on('finish', finishListener)
      dicer.write(writePart + writeSep)

      function partListener (partReadStream) {
        partReadStream.on('data', function () { })
        partReadStream.on('end', partEndListener)
      }
      function partEndListener () {
        firedEnd = true
        setImmediate(afterEnd)
      }
      function afterEnd () {
        dicer.end(writeEnd)
        setImmediate(afterWrite)
      }
      function finishListener () {
        t.assert.ok(firedEnd, 'end before finishing')
        firedFinish = true
        test2()
      }
      function afterWrite () {
        t.assert.ok(firedFinish, 'Failed to finish')
      }

      let isPausePush = true

      let firedPauseCallback = false
      let firedPauseFinish = false

      let dicer2 = null

      function test2 () {
        dicer2 = new Dicer({ boundary })
        dicer2.on('part', pausePartListener)
        dicer2.on('finish', pauseFinish)
        dicer2.write(writePart + writeSep, 'utf8', pausePartCallback)
        setImmediate(pauseAfterWrite)
      }
      function pausePartListener (partReadStream) {
        partReadStream.on('data', function () { })
        partReadStream.on('end', function () { })
        const realPush = partReadStream.push
        partReadStream.push = function fakePush () {
          realPush.apply(partReadStream, arguments)
          if (!isPausePush) { return true }
          isPausePush = false
          return false
        }
      }
      function pauseAfterWrite () {
        dicer2.end(writeEnd)
        setImmediate(pauseAfterEnd)
      }
      function pauseAfterEnd () {
        t.assert.ok(firedPauseCallback, 'Called callback after pause')
        t.assert.ok(firedPauseFinish, 'Finish after pause')
        resolve()
      }
      function pauseFinish () {
        firedPauseFinish = true
      }
      function pausePartCallback () {
        firedPauseCallback = true
      }
    })
  })
})
