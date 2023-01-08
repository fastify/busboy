'use strict'
const { performance } = require('node:perf_hooks')
const Busboy = require('busboy');

const { createMultipartBufferForEncodingBench } = require("./createMultipartBufferForEncodingBench");

for (var i = 0, il = 10000; i < il; i++) { // eslint-disable-line no-var
  const boundary = '-----------------------------168072824752491622650073',
    busboy = Busboy({
      headers: {
        'content-type': 'multipart/form-data; boundary=' + boundary
      }
    }),
    buffer = createMultipartBufferForEncodingBench(boundary, 100, 'iso-8859-1'),
    mb = buffer.length / 1048576;

  let processedData = 0;
  busboy.on('file', (field, file, filename, encoding, mimetype) => {
    file.resume()
  })

  busboy.on('error', function (err) {
  })
  busboy.on('finish', function () {
  })

  const start = performance.now();
  const result = busboy.write(buffer, () => { });
  busboy.end();
  const duration = performance.now() - start;
  const mbPerSec = (mb / (duration / 1000)).toFixed(2);
  console.log(mbPerSec + ' mb/sec');
}