'use strict'

const { test } = require('node:test')
const assert = require('node:assert/strict')
const { setTimeout: delay } = require('node:timers/promises')
const Busboy = require('../index.js')

test('destroying an emitted file stream with an error terminates Busboy with an error', async () => {
  const reason = new Error('consumer cancelled')
  const busboy = new Busboy({
    headers: {
      'content-type': 'multipart/form-data; boundary=abc'
    }
  })
  let file
  const events = []

  busboy.on('error', err => {
    events.push(`busboy error: ${err.message}`)
  })
  busboy.on('close', () => events.push('busboy close'))
  busboy.on('finish', () => events.push('busboy finish'))

  busboy.on('file', (_name, stream) => {
    file = stream
    file.on('error', err => {
      events.push(`file error: ${err.message}`)
    })
    file.on('close', () => events.push('file close'))
    file.on('end', () => events.push('file end'))

    queueMicrotask(() => {
      file.destroy(reason)
    })
  })

  const body =
    '--abc\r\n' +
    'Content-Disposition: form-data; name="file"; filename="test.txt"\r\n' +
    '\r\n' +
    'hello world\r\n--abc--\r\n'

  busboy.end(body)

  await delay(50)

  assert.ok(file.destroyed)
  assert.ok(busboy.destroyed)
  assert.ok(events.includes('file error: consumer cancelled'))
  assert.ok(events.includes('busboy error: consumer cancelled'))
  assert.ok(events.includes('busboy close'))
  assert.ok(!events.includes('busboy finish'))
})

test('destroying Busboy with an error destroys active emitted file streams', async () => {
  const reason = new Error('upload aborted')
  const busboy = new Busboy({
    headers: {
      'content-type': 'multipart/form-data; boundary=abc'
    }
  })
  let file
  const events = []

  busboy.on('error', err => {
    events.push(`busboy error: ${err.message}`)
  })
  busboy.on('close', () => events.push('busboy close'))

  busboy.on('file', (_name, stream) => {
    file = stream
    file.on('error', err => {
      events.push(`file error: ${err.message}`)
    })
    file.on('close', () => events.push('file close'))
    file.on('end', () => events.push('file end'))

    queueMicrotask(() => {
      busboy.destroy(reason)
    })
  })

  const body =
    '--abc\r\n' +
    'Content-Disposition: form-data; name="file"; filename="test.txt"\r\n' +
    '\r\n' +
    'partial content'

  busboy.write(body)

  await delay(50)

  assert.ok(file.destroyed)
  assert.ok(busboy.destroyed)
  assert.ok(events.includes('file error: upload aborted'))
  assert.ok(events.includes('busboy error: upload aborted'))
  assert.ok(events.includes('file close'))
})

test('destroying an emitted file stream without error allows Busboy to finish', async () => {
  const busboy = new Busboy({
    headers: {
      'content-type': 'multipart/form-data; boundary=abc'
    }
  })
  let file
  let finished = false

  busboy.on('finish', () => {
    finished = true
  })

  busboy.on('file', (_name, stream) => {
    file = stream
    queueMicrotask(() => {
      file.destroy()
    })
  })

  const body =
    '--abc\r\n' +
    'Content-Disposition: form-data; name="file"; filename="test.txt"\r\n' +
    '\r\n' +
    'hello\r\n--abc--\r\n'

  busboy.end(body)

  await delay(50)

  assert.ok(file.destroyed)
  assert.ok(finished)
})

test('destroying file stream ignores subsequent incoming data chunks', async () => {
  const busboy = new Busboy({
    headers: {
      'content-type': 'multipart/form-data; boundary=abc'
    }
  })
  let file

  busboy.on('file', (_name, stream) => {
    file = stream
    stream.destroy()
  })

  busboy.write(
    '--abc\r\n' +
    'Content-Disposition: form-data; name="file"; filename="test.txt"\r\n' +
    '\r\n' +
    'chunk1'
  )

  busboy.write('chunk2')
  busboy.end('\r\n--abc--\r\n')

  await delay(50)

  assert.ok(file.destroyed)
})

test('destroying Busboy with urlencoded content type calls destroy on parser', async () => {
  const busboy = new Busboy({
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    }
  })
  const err = new Error('abort')
  busboy.on('error', () => {})
  busboy.destroy(err)
  await delay(10)
  assert.ok(busboy.destroyed)
})
