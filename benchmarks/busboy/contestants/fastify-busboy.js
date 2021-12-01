const Busboy = require('../../../lib/main')

const boundary = '-----------------------------paZqsnEHRufoShdX6fh0lUhXBP4k'

function createMultipartBuffer (boundary, size) {
  const payload = [
    boundary,
    'Content-Disposition: form-data; name="file"; filename*=utf-8\'\'n%C3%A4me.txt',
    'Content-Type: application/octet-stream',
    '',
    Buffer.allocUnsafe(size).toString('hex'),
    boundary + '--'
  ].join('\r\n')
  return Buffer.from(payload, 'ascii')
}

function process () {
  const busboy = new Busboy({
    headers: {
      'content-type': 'multipart/form-data; boundary=' + boundary
    }
  })
  const mb = 100
  const buffer = createMultipartBuffer(boundary, mb * 1024 * 1024)
  const callbacks =
          {
            partBegin: -1,
            partEnd: -1,
            headerField: -1,
            headerValue: -1,
            partData: -1,
            end: -1
          }

  let processedData = ''

  return new Promise((resolve, reject) => {
    busboy.on('part', function (p) {
      callbacks.partBegin++
      p.on('header', function (header) {
        /* for (var h in header)
              console.log('Part header: k: ' + inspect(h) + ', v: ' + inspect(header[h])); */
      })
      p.on('data', function (data) {
        callbacks.partData++
        processedData += data
        // console.log('Part data: ' + inspect(data.toString()));
      })
      p.on('end', function () {
        // console.log('End of part\n');
        callbacks.partEnd++
      })
      p.on('error', (err) => {
        reject(err)
      })
    })
    busboy.on('end', function () {
      // console.log('End of parts');
      callbacks.end++
      resolve(processedData)
    })
    busboy.on('error', (err) => {
      reject(err)
    })

    busboy.on('finish', function () {
      resolve(processedData)
    })

    busboy.write(buffer)
  })
}

module.exports = {
  process
}
