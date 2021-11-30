var multipartParser = require('formidable'),
  MultipartParser = multipartParser.MultipartParser;
const { createMultipartBuffer } = require("../createMultipartBuffer");

for (let i = 0, il = 10; i < il; i++) {
  const parser = new MultipartParser(),
    boundary = '-----------------------------168072824752491622650073',
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


  parser.initWithBoundary(boundary);
  parser.onHeaderField = function () {
    callbacks.headerField++;
  };

  parser.onHeaderValue = function () {
    callbacks.headerValue++;
  };

  parser.onPartBegin = function () {
    callbacks.partBegin++;
  };

  parser.onPartData = function () {
    callbacks.partData++;
  };

  parser.onPartEnd = function () {
    callbacks.partEnd++;
  };

  parser.onEnd = function () {
    callbacks.end++;
  };

  var start = +new Date(),
    nparsed = parser.write(buffer),
    duration = +new Date - start,
    mbPerSec = (mb / (duration / 1000)).toFixed(2);

  console.log(mbPerSec + ' mb/sec');
}

