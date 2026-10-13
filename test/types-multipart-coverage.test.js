'use strict'

const { Readable } = require('node:stream')
const { test } = require('node:test')
const Busboy = require('..')

const EMPTY_FN = function () {}

function buildBody (parts, boundary) {
  const sep = '--' + boundary
  return parts.map(part => {
    return [sep, ...part].join('\r\n')
  }).join('\r\n') + '\r\n' + sep + '--\r\n'
}

test('multipart parser accepts prototype property names', async (t) => {
  const boundary = 'prototypeheader'
  const names = ['__proto__', 'constructor']

  for (const name of names) {
    const body = buildBody([[
      'Content-Disposition: form-data; name="field"',
      `${name}: injected`,
      '',
      'value'
    ]], boundary)

    for (const piped of [false, true]) {
      const busboy = new Busboy({
        headers: { 'content-type': 'multipart/form-data; boundary=' + boundary }
      })
      let field
      busboy.on('field', (key, value) => { field = [key, value] })

      const finished = new Promise((resolve, reject) => {
        busboy.once('finish', resolve)
        busboy.once('error', reject)
      })

      if (piped) {
        Readable.from([Buffer.from(body, 'utf8')]).pipe(busboy)
      } else {
        busboy.end(Buffer.from(body, 'utf8'))
      }

      await finished
      t.assert.deepStrictEqual(field, ['field', 'value'])
    }
  }
})

test('multipart parser rejects bare CR or LF in disposition parameters', async (t) => {
  const boundary = 'barecrlf'
  const dispositionValues = [
    'form-data; name="field\rname"',
    'form-data; name="field\nname"',
    'form-data; name="field"; filename="file\rname.txt"',
    'form-data; name="field"; filename="file\nname.txt"',
    "form-data; name*=utf-8''field%0Dname",
    "form-data; name*=utf-8''field%0Aname",
    "form-data; name=field; filename*=utf-8''file%0Dname.txt",
    "form-data; name=field; filename*=utf-8''file%0Aname.txt"
  ]

  for (const disposition of dispositionValues) {
    const body = buildBody([[
      `Content-Disposition: ${disposition}`,
      '',
      'value'
    ]], boundary)
    const busboy = new Busboy({
      headers: { 'content-type': 'multipart/form-data; boundary=' + boundary }
    })
    let emitted = false
    busboy.on('field', () => { emitted = true })
    busboy.on('file', (_field, stream) => {
      emitted = true
      stream.resume()
    })

    busboy.end(Buffer.from(body, 'binary'))
    await new Promise((resolve, reject) => {
      busboy.once('finish', resolve)
      busboy.once('error', reject)
    })
    t.assert.strictEqual(emitted, false)
  }
})

test('partsLimit fires when more parts than limit', async (t) => {
  const boundary = 'xyzboundary'
  const body = buildBody([
    ['Content-Disposition: form-data; name="a"', '', '1'],
    ['Content-Disposition: form-data; name="b"', '', '2'],
    ['Content-Disposition: form-data; name="c"', '', '3']
  ], boundary)

  const busboy = new Busboy({
    headers: { 'content-type': 'multipart/form-data; boundary=' + boundary },
    limits: { parts: 1 }
  })

  const fields = []
  const events = []
  busboy.on('field', (key, val) => fields.push([key, val]))
  busboy.on('partsLimit', () => events.push('partsLimit'))
  busboy.on('finish', () => events.push('finish'))

  busboy.write(Buffer.from(body, 'utf8'), EMPTY_FN)
  busboy.end()

  await new Promise(resolve => busboy.on('finish', resolve))
  t.assert.ok(events.includes('partsLimit'), 'partsLimit emitted')
  t.assert.ok(events.includes('finish'), 'finish emitted')
  t.assert.ok(fields.length >= 1, 'first part emitted as field')
  t.assert.ok(fields.length < 3, 'later parts were skipped')
})

test('parser drain resumes a paused write callback', async (t) => {
  const boundary = 'drainboundary'
  const body = buildBody([
    ['Content-Disposition: form-data; name="a"', '', 'value']
  ], boundary)

  const busboy = new Busboy({
    headers: { 'content-type': 'multipart/form-data; boundary=' + boundary }
  })

  let cbInvoked = false
  busboy.on('field', (key, val) => t.assert.strictEqual(key + ':' + val, 'a:value'))

  const parser = busboy._parser
  parser._cb = () => { cbInvoked = true }
  parser.parser.emit('drain')

  busboy.write(Buffer.from(body, 'utf8'), EMPTY_FN)
  busboy.end()

  await new Promise(resolve => busboy.on('finish', resolve))
  t.assert.ok(cbInvoked, 'write callback invoked after drain')
})

test('part without content-disposition is skipped', async (t) => {
  const boundary = 'nocdisp'
  const body = buildBody([
    ['Content-Type: text/plain', '', 'ignored'],
    ['Content-Disposition: form-data; name="kept"', '', 'value']
  ], boundary)

  const busboy = new Busboy({
    headers: { 'content-type': 'multipart/form-data; boundary=' + boundary }
  })

  const fields = []
  busboy.on('field', (key, val) => fields.push([key, val]))

  busboy.write(Buffer.from(body, 'utf8'), EMPTY_FN)
  busboy.end()

  await new Promise(resolve => busboy.on('finish', resolve))
  t.assert.strictEqual(fields.length, 1)
  t.assert.deepStrictEqual(fields[0], ['kept', 'value'])
})

test('part with content-transfer-encoding is parsed', async (t) => {
  const boundary = 'cteboundary'
  const body = buildBody([
    [
      'Content-Disposition: form-data; name="binary"',
      'Content-Transfer-Encoding: base64',
      '',
      'aGVsbG8='
    ]
  ], boundary)

  let receivedEncoding = null
  const busboy = new Busboy({
    headers: { 'content-type': 'multipart/form-data; boundary=' + boundary }
  })

  busboy.on('field', (key, val, _truncName, _truncVal, encoding) => {
    t.assert.strictEqual(key, 'binary')
    receivedEncoding = encoding
  })

  busboy.write(Buffer.from(body, 'utf8'), EMPTY_FN)
  busboy.end()

  await new Promise(resolve => busboy.on('finish', resolve))
  t.assert.strictEqual(receivedEncoding, 'base64')
})

test('FileStream._read is callable', async (t) => {
  const boundary = 'fsread'
  const body = buildBody([
    ['Content-Disposition: form-data; name="f"; filename="a.txt"', 'Content-Type: application/octet-stream', '', 'payload']
  ], boundary)

  const busboy = new Busboy({
    headers: { 'content-type': 'multipart/form-data; boundary=' + boundary }
  })

  let readCalled = false
  busboy.on('file', (name, stream) => {
    t.assert.strictEqual(name, 'f')
    const proto = Object.getPrototypeOf(stream)
    proto._read.call(stream, 1)
    t.assert.strictEqual(typeof stream._read, 'function', 'FileStream._read is a function')
    readCalled = true
    stream.resume()
  })

  busboy.write(Buffer.from(body, 'utf8'), EMPTY_FN)
  busboy.end()

  await new Promise(resolve => busboy.on('finish', resolve))
  t.assert.ok(readCalled, 'file._read was invoked')
})

test('multipart parser emits curFile error when Dicer parser errors during a file part', async (t) => {
  const boundary = 'errcurfile'
  const busboy = new Busboy({
    headers: { 'content-type': 'multipart/form-data; boundary=' + boundary }
  })

  let curFileErr = null
  busboy.on('error', () => {})
  busboy.on('file', (name, stream) => {
    stream.on('error', (err) => { curFileErr = err })
  })

  const part = '--' + boundary + '\r\n' +
    'Content-Disposition: form-data; name="f"; filename="a.txt"\r\n' +
    'Content-Type: application/octet-stream\r\n\r\n'
  const more = 'payload'

  busboy.write(Buffer.from(part + more, 'utf8'), EMPTY_FN)
  setImmediate(() => {
    try {
      busboy._parser.parser.emit('error', new Error('forced parser error'))
    } catch {}
  })
  busboy.end()

  await new Promise(resolve => setTimeout(resolve, 50))
  t.assert.ok(curFileErr, 'curFile emitted an error')
})
