'use strict'
const { performance } = require('node:perf_hooks')
const Busboy = require('../lib/main');

const { createMultipartBufferForEncodingBench } = require("./createMultipartBufferForEncodingBench");

for (var i = 0, il = 10000; i < il; i++) { // eslint-disable-line no-var
  const boundary = '-----------------------------168072824752491622650073',
    busboy = new Busboy({
      headers: {
        'content-type': 'multipart/form-data; boundary=' + boundary
      }
    }),
    buffer = createMultipartBufferForEncodingBench(boundary, 100, 'utf-8'),
    mb = buffer.length / 1048576;

  busboy.on('file', (field, file, filename, encoding, mimetype) => {
    file.resume()
  })

  busboy.on('error', function (err) {
  })
  busboy.on('finish', function () {
  })

  const start = performance.now();
  busboy.write(buffer, () => { });
  busboy.end();
  const duration = performance.now() - start;
  const mbPerSec = (mb / (duration / 1000)).toFixed(2);
  console.log(mbPerSec + ' mb/sec');
}
