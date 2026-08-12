'use strict'

const { spawnSync } = require('node:child_process')
const { test } = require('node:test')
const Multipart = require('../lib/types/multipart')
const Busboy = require('..')

test('multipart constructor', async t => {
  t.plan(2)

  await t.test('throws if the boundary is not a string', t => {
    const busboy = new Busboy({ headers: { 'content-type': 'application/x-www-form-urlencoded' } })

    t.assert.throws(() => new Multipart(busboy, { boundary: 123 }), { message: 'Multipart: Boundary not found' })
    t.assert.ok('end')
  })

  await t.test('processes a fragmented 252-byte boundary without hanging', t => {
    t.plan(1)

    const script = `
      const Busboy = require(${JSON.stringify(require.resolve('..'))})
      const boundary = 'A'.repeat(252)
      const parser = Busboy({
        headers: { 'content-type': 'multipart/form-data; boundary=' + boundary }
      })
      parser.write(Buffer.from('--' + boundary.slice(0, -1)))
      parser.write(Buffer.from('X'), (error) => process.exit(error ? 1 : 0))
      setTimeout(() => process.exit(1), 500)
    `
    const result = spawnSync(process.execPath, ['-e', script], { timeout: 2000 })

    t.assert.deepStrictEqual(
      { error: result.error && result.error.code, signal: result.signal, status: result.status },
      { error: undefined, signal: null, status: 0 }
    )
  })
})
