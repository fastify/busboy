const Busboy = require('busboy');
const { createMultipartBufferForFormBench } = require("./createMultipartBufferForFormBench");

for (var i = 0, il = 10; i < il; i++) { // eslint-disable-line no-var
  const boundary = '-----------------------------168072824752491622650073',
    d = new Busboy({
      headers: {
        'content-type': 'multipart/form-data; boundary=' + boundary
      }
    }),
    buffer = createMultipartBufferForFormBench(boundary, 100000, 'utf-8'),
    mb = buffer.length / 1048576,
    callbacks =
    {
      partBegin: -1,
      partEnd: -1,
      headerField: -1,
      headerValue: -1,
      partData: -1,
      end: -1,
    };

  d.on('part', function (p) {
    callbacks.partBegin++;
    p.on('header', function (header) {
    });
    p.on('data', function (data) {
      callbacks.partData++;
    });
    p.on('end', function () {
      callbacks.partEnd++;
    });
  });
  d.on('end', function () {
    callbacks.end++;
  });

  const start = +new Date();
  d.write(buffer);
  const duration = +new Date - start;
  const mbPerSec = (mb / (duration / 1000)).toFixed(2);

  console.log(mbPerSec + ' mb/sec');
}
