'use strict'

const Dicer = require('../deps/dicer/lib/Dicer')
const { test } = require('node:test')

test('dicer _oninfo with _justMatched=true and data starting with single dash', async (t) => {
  await new Promise(resolve => {
    const boundary = 'bnd'
    const dicer = new Dicer({ boundary })
    dicer.on('error', () => {})
    dicer.on('part', () => {})
    dicer.on('preamble', () => {})

    dicer._part = undefined
    dicer._justMatched = true
    dicer._dashes = 0
    dicer._isPreamble = true
    dicer._inHeader = false
    dicer._ignoreData = false

    const buf = Buffer.from('-XY')
    dicer._oninfo(false, buf, 0, buf.length)

    resolve()
  })
})

test('dicer _oninfo with _justMatched=true, buf pushed into hparser when in header', async (t) => {
  await new Promise(resolve => {
    const boundary = 'bnd'
    const dicer = new Dicer({ boundary })
    dicer.on('error', () => {})
    dicer.on('part', () => {})

    dicer._part = undefined
    dicer._justMatched = true
    dicer._dashes = 0
    dicer._isPreamble = false
    dicer._inHeader = true
    dicer._ignoreData = false

    const buf = Buffer.from('-XY')
    dicer._oninfo(false, buf, 0, buf.length)

    resolve()
  })
})

test('dicer ignored part error triggers EMPTY_FN', async (t) => {
  await new Promise(resolve => {
    const boundary = 'ignorefn'
    const dicer = new Dicer({ boundary })
    dicer.on('error', () => {})

    dicer.write('--' + boundary + '\r\nignored preamble content\r\n--' + boundary + '\r\n')
    setImmediate(() => {
      const part = dicer._part
      if (part) {
        try { part.emit('error', new Error('forced')) } catch {}
      }
      dicer.end()
    })

    dicer.on('finish', () => resolve())
  })
})
