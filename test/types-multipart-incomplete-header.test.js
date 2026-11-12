'use strict'

const { test } = require('node:test')
const Busboy = require('..')

function parse (boundary, body, splitAt) {
  return new Promise((resolve, reject) => {
    const busboy = new Busboy({
      headers: { 'content-type': 'multipart/form-data; boundary=' + boundary }
    })
    const events = []
    const timer = setTimeout(() => {
      reject(new Error('neither finish nor error was emitted (split at ' + splitAt + ')'))
    }, 1000)

    busboy.on('field', (name, value) => events.push(['field', name, value]))
    busboy.on('file', (name, stream) => {
      events.push(['file', name])
      stream.resume()
    })
    busboy.on('error', (err) => events.push(['error', err.message]))
    busboy.on('finish', () => {
      clearTimeout(timer)
      events.push(['finish'])
      resolve(events)
    })

    const buf = Buffer.from(body, 'latin1')
    if (splitAt === undefined) {
      busboy.end(buf)
    } else {
      busboy.write(buf.subarray(0, splitAt))
      busboy.end(buf.subarray(splitAt))
    }
  })
}

const cases = [
  {
    name: 'next part with an unterminated header block followed by the closing delimiter',
    boundary: 'b',
    body: [
      '--b',
      'Content-Disposition: form-data; name="a"',
      '',
      'x',
      '--b',
      'Content-Disposition: form-data; name="b"',
      '--b--'
    ].join('\r\n'),
    expected: [['field', 'a', 'x'], ['finish']]
  },
  {
    name: 'only part with an unterminated header block followed by the closing delimiter',
    boundary: 'x',
    body: '--x\r\nContent-Disposition: form-data; name="a"\r\n--x--\r\n',
    expected: [['finish']]
  },
  {
    name: 'delimiter immediately after the header terminator',
    boundary: 'XyZ',
    body: '--XyZ\r\n' +
      'Content-Disposition: form-data; name="f0"\r\n' +
      '\r\n' +
      '--XyZ\r\n' +
      'Content-Disposition: form-data; name="f1"\r\n' +
      '\r\n' +
      'b\r\n' +
      '--XyZ--\r\n',
    expected: [['field', 'f1', 'b'], ['finish']]
  },
  {
    name: 'unterminated header block followed by a non-closing delimiter',
    boundary: 'b',
    body: [
      '--b',
      'Content-Disposition: form-data; name="a"',
      '--b',
      'Content-Disposition: form-data; name="c"',
      '',
      'y',
      '--b--'
    ].join('\r\n'),
    expected: [['field', 'c', 'y'], ['finish']]
  }
]

for (const { name, boundary, body, expected } of cases) {
  test('finishes when a part header is cut off by a delimiter: ' + name, async (t) => {
    t.assert.deepStrictEqual(await parse(boundary, body), expected)
  })

  test('finishes for every two-chunk split: ' + name, async (t) => {
    for (let i = 1; i < body.length; ++i) {
      t.assert.deepStrictEqual(await parse(boundary, body, i), expected, 'split at ' + i)
    }
  })
}

test('a cut-off header block does not use up the next part\'s header limits', async (t) => {
  const busboy = new Busboy({
    headers: { 'content-type': 'multipart/form-data; boundary=b' },
    limits: { headerSize: 100, headerPairs: 2 }
  })
  const fields = []

  await new Promise((resolve, reject) => {
    busboy.on('field', (name, value) => fields.push([name, value]))
    busboy.on('error', reject)
    busboy.on('finish', resolve)
    busboy.end(Buffer.from(
      '--b\r\nX: ' + 'a'.repeat(200) + '\r\n' +
      '--b\r\nA: 1\r\nB: 2\r\n' +
      '--b\r\nContent-Disposition: form-data; name="ok"\r\n\r\nv\r\n' +
      '--b--\r\n'
    ))
  })

  t.assert.deepStrictEqual(fields, [['ok', 'v']])
})

test('still waits for a part whose header completed before the delimiter', async (t) => {
  const body = '--b\r\n' +
    'Content-Disposition: form-data; name="file"; filename="a.txt"\r\n' +
    '\r\n' +
    'content\r\n' +
    '--b--\r\n'
  const busboy = new Busboy({
    headers: { 'content-type': 'multipart/form-data; boundary=b' }
  })
  const order = []

  await new Promise((resolve) => {
    busboy.on('file', (name, stream) => {
      const chunks = []
      stream.on('data', (d) => chunks.push(d))
      stream.on('end', () => order.push(['file end', Buffer.concat(chunks).toString()]))
    })
    busboy.on('finish', () => {
      order.push(['finish'])
      resolve()
    })
    busboy.end(Buffer.from(body))
  })

  t.assert.deepStrictEqual(order, [['file end', 'content'], ['finish']])
})
