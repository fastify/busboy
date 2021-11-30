// A special, edited version of the multipart parser from parted is needed here
// because otherwise it attempts to do some things above and beyond just parsing
// -- like saving to disk and whatnot

const { createMultipartBuffer } = require("../createMultipartBuffer");

for (let i = 0, il = 10; i < il; i++) {
  var Parser = require('./parted-multipart'),
    boundary = '-----------------------------168072824752491622650073',
    parser = new Parser('boundary=' + boundary),
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


  parser.on('header', function () {
    //callbacks.headerField++;
  });

  parser.on('data', function () {
    //callbacks.partBegin++;
  });

  parser.on('part', function () {

  });

  parser.on('end', function () {
    //callbacks.end++;
  });

  var start = +new Date(),
    nparsed = parser.write(buffer),
    duration = +new Date - start,
    mbPerSec = (mb / (duration / 1000)).toFixed(2);

  console.log(mbPerSec + ' mb/sec');
}