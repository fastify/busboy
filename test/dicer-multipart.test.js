'use strict'

const Dicer = require('../deps/dicer/lib/Dicer')
const fs = require('node:fs')
const path = require('node:path')
const inspect = require('node:util').inspect
const { test } = require('node:test')

const FIXTURES_ROOT = path.join(__dirname, 'fixtures/')

test('dicer-multipart', async t => {
  const tests =
    [
      {
        source: 'nested',
        opts: { boundary: 'AaB03x' },
        chsize: 32,
        nparts: 2,
        what: 'One nested multipart',
        plan: 10
      },
      {
        source: 'many',
        opts: { boundary: '----WebKitFormBoundaryWLHCs9qmcJJoyjKR' },
        chsize: 16,
        nparts: 7,
        what: 'Many parts',
        plan: 20
      },
      {
        source: 'many-wrongboundary',
        opts: { boundary: 'LOLOLOL' },
        chsize: 8,
        nparts: 0,
        dicerError: true,
        what: 'Many parts, wrong boundary',
        plan: 6
      },
      {
        source: 'many-noend',
        opts: { boundary: '----WebKitFormBoundaryWLHCs9qmcJJoyjKR' },
        chsize: 16,
        nparts: 7,
        npartErrors: 1,
        dicerError: true,
        what: 'Many parts, end boundary missing, 1 file open',
        plan: 20
      },
      {
        source: 'nested-full',
        opts: { boundary: 'AaB03x', headerFirst: true },
        chsize: 32,
        nparts: 2,
        what: 'One nested multipart with preceding header',
        plan: 10
      },
      {
        source: 'nested-full',
        opts: { headerFirst: true },
        chsize: 32,
        nparts: 2,
        setBoundary: 'AaB03x',
        what: 'One nested multipart with preceding header, using setBoundary',
        plan: 10
      }
    ]

  t.plan(tests.length)

  for (const v of tests) {
    await t.test(v.what, async t => {
      t.plan(v.plan)
      await new Promise((resolve) => {
        const fixtureBase = FIXTURES_ROOT + v.source
        const state = { parts: [], preamble: undefined }

        const dicer = new Dicer(v.opts)
        let error
        let partErrors = 0
        let finishes = 0

        dicer.on('preamble', function (p) {
          const preamble = {
            body: undefined,
            bodylen: 0,
            error: undefined,
            header: undefined
          }

          p.on('header', function (h) {
            preamble.header = h
            if (v.setBoundary) { dicer.setBoundary(v.setBoundary) }
          }).on('data', function (data) {
          // make a copy because we are using readSync which re-uses a buffer ...
            const copy = Buffer.allocUnsafe(data.length)
            data.copy(copy)
            data = copy
            if (!preamble.body) { preamble.body = [data] } else { preamble.body.push(data) }
            preamble.bodylen += data.length
          }).on('error', function (err) {
            preamble.error = err
          }).on('end', function () {
            if (preamble.body) { preamble.body = Buffer.concat(preamble.body, preamble.bodylen) }
            if (preamble.body || preamble.header) { state.preamble = preamble }
          })
        })
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
            if (!part.body) { part.body = [data] } else { part.body.push(data) }
            part.bodylen += data.length
          }).on('error', function (err) {
            part.error = err
            ++partErrors
          }).on('end', function () {
            if (part.body) { part.body = Buffer.concat(part.body, part.bodylen) }
            state.parts.push(part)
          })
        }).on('error', function (err) {
          error = err
        }).on('finish', function () {
          t.assert.strictEqual(finishes++ === 0, true, makeMsg(v.what, 'finish emitted multiple times'))

          if (v.dicerError) { t.assert.strictEqual(error !== undefined, true, makeMsg(v.what, 'Expected error')) } else { t.assert.strictEqual(error === undefined, true, makeMsg(v.what, 'Unexpected error: ' + error)) }

          let preamble
          if (fs.existsSync(fixtureBase + '/preamble')) {
            const prebody = fs.readFileSync(fixtureBase + '/preamble')
            if (prebody.length) {
              preamble = {
                body: prebody,
                bodylen: prebody.length,
                error: undefined,
                header: undefined
              }
            }
          }
          if (fs.existsSync(fixtureBase + '/preamble.header')) {
            const prehead = JSON.parse(fs.readFileSync(fixtureBase +
            '/preamble.header', 'binary'))
            if (!preamble) {
              preamble = {
                body: undefined,
                bodylen: 0,
                error: undefined,
                header: prehead
              }
            } else { preamble.header = prehead }
          }
          if (fs.existsSync(fixtureBase + '/preamble.error')) {
            const err = new Error(fs.readFileSync(fixtureBase +
            '/preamble.error', 'binary'))
            if (!preamble) {
              preamble = {
                body: undefined,
                bodylen: 0,
                error: err,
                header: undefined
              }
            } else { preamble.error = err }
          }

          t.assert.deepEqual(state.preamble,
            preamble,
            makeMsg(v.what,
              'Preamble mismatch:\nActual:' +
            inspect(state.preamble) +
            '\nExpected: ' +
            inspect(preamble)))

          t.assert.equal(state.parts.length,
            v.nparts,
            makeMsg(v.what,
              'Part count mismatch:\nActual: ' +
            state.parts.length +
            '\nExpected: ' +
            v.nparts))

          if (!v.npartErrors) { v.npartErrors = 0 }
          t.assert.equal(partErrors,
            v.npartErrors,
            makeMsg(v.what,
              'Part errors mismatch:\nActual: ' +
            partErrors +
            '\nExpected: ' +
            v.npartErrors))

          for (let i = 0, header, body; i < v.nparts; ++i) {
            if (fs.existsSync(fixtureBase + '/part' + (i + 1))) {
              body = fs.readFileSync(fixtureBase + '/part' + (i + 1))
              if (body.length === 0) { body = undefined }
            } else { body = undefined }
            t.assert.deepEqual(state.parts[i].body,
              body,
              makeMsg(v.what,
                'Part #' + (i + 1) + ' body mismatch'))
            if (fs.existsSync(fixtureBase + '/part' + (i + 1) + '.header')) {
              header = fs.readFileSync(fixtureBase +
              '/part' + (i + 1) + '.header', 'binary')
              header = JSON.parse(header)
            } else { header = undefined }
            t.assert.deepEqual(state.parts[i].header,
              header,
              makeMsg(v.what,
                'Part #' + (i + 1) +
              ' parsed header mismatch:\nActual: ' +
              inspect(state.parts[i].header) +
              '\nExpected: ' +
              inspect(header)))
          }
          t.assert.ok('pass')
          resolve()
        })

        fs.createReadStream(fixtureBase + '/original').pipe(dicer)
      })
    })
  }
})

function makeMsg (what, msg) {
  return what + ': ' + msg
}
