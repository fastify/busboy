'use strict'

const { test } = require('node:test')
const { setImmediate: nextTick } = require('node:timers/promises')
const Busboy = require('..')

function multipartBody (boundary, extra) {
  return '--' + boundary + '\r\n' +
    'Content-Disposition: form-data; name="field"\r\n' +
    '\r\n' +
    'value\r\n' +
    '--' + boundary + '--\r\n' +
    (extra || '')
}

test('emits finish when an RFC 2046 epilogue arrives in a later write', async (t) => {
  const boundary = 'boundary'
  const busboy = new Busboy({
    headers: { 'content-type': 'multipart/form-data; boundary=' + boundary }
  })

  const fields = []
  busboy.on('field', (name, value) => fields.push([name, value]))

  const finished = new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('finish was never emitted'))
    }, 1000)
    busboy.once('finish', () => {
      clearTimeout(timer)
      resolve()
    })
    busboy.once('error', (err) => {
      clearTimeout(timer)
      reject(err)
    })
  })

  busboy.write(Buffer.from(multipartBody(boundary), 'utf8'))
  await nextTick()
  busboy.write(Buffer.from('epilogue', 'utf8'))
  busboy.end()

  await finished
  t.assert.deepStrictEqual(fields, [['field', 'value']])
})

test('still emits finish when the epilogue is in the same chunk as the closing delimiter', async (t) => {
  const boundary = 'boundary'
  const busboy = new Busboy({
    headers: { 'content-type': 'multipart/form-data; boundary=' + boundary }
  })

  const fields = []
  busboy.on('field', (name, value) => fields.push([name, value]))

  const finished = new Promise((resolve, reject) => {
    busboy.once('finish', resolve)
    busboy.once('error', reject)
  })

  busboy.write(Buffer.from(multipartBody(boundary, 'epilogue'), 'utf8'))
  busboy.end()

  await finished
  t.assert.deepStrictEqual(fields, [['field', 'value']])
})
