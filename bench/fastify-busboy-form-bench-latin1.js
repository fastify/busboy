const Busboy = require('../lib/main');
const { createMultipartBufferForFormBench } = require("./createMultipartBufferForFormBench");

for (var i = 0, il = 10; i < il; i++) { // eslint-disable-line no-var
  const boundary = '-----------------------------168072824752491622650073',
    d = new Busboy({
      headers: {
        'content-type': 'multipart/form-data; boundary=' + boundary
      }
    }),
    buffer = createMultipartBufferForFormBench(boundary, 100000, 'iso-8859-1'),
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
      console.log('errr')
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
  d.on('error', function () {
    callbacks.end++;
  });

  const start = +new Date();
  const result = d.write(buffer);
  const duration = +new Date - start;
  const mbPerSec = (mb / (duration / 1000)).toFixed(2);

  console.log(mbPerSec + ' mb/sec');
}
