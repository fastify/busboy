var multipartser = require('multipartser');
const { createMultipartBuffer } = require("../createMultipartBuffer");

for (let i = 0, il = 10; i < il; i++) {
  const boundary = '-----------------------------168072824752491622650073',
    parser = multipartser(),
    mb = 100,
    buffer = createMultipartBuffer(boundary, mb * 1024 * 1024),
    callbacks =
    {
      partBegin: -1,
      partEnd: -1,
      headerField: -1,
      headerValue: -1,
      partData: -1,
      end: -1,
    };

  parser.boundary(boundary);

  parser.on('part', function (part) {
  });

  parser.on('end', function () {
    //console.log( 'completed parsing' );
  });

  parser.on('error', function (error) {
    console.error(error);
  });

  var start = +new Date(),
    nparsed = parser.data(buffer),
    nend = parser.end(),
    duration = +new Date - start,
    mbPerSec = (mb / (duration / 1000)).toFixed(2);

  console.log(mbPerSec + ' mb/sec');

  //assert.equal(nparsed, buffer.length);

}