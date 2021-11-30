const Benchmark = require('benchmark');
const BusboyLegacy = require('busboy');
const FastifyBusboy = require('../lib/main');
const Multipartser = require('multipartser');
const Formidable = require('formidable').MultipartParser;
const { createMultipartBuffer } = require('./createMultipartBuffer');
const suite = new Benchmark.Suite;

const mb = 10;

// add tests
suite
  .add('busboy fastify', function () {
    const boundary = '-----------------------------168072824752491622650073',
      d = new FastifyBusboy({
        headers: {
          'content-type': 'multipart/form-data; boundary=' + boundary
        }
      }),
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


    d.on('part', function (p) {
      callbacks.partBegin++;
      p.on('header', function (header) {
        /*for (var h in header)
        console.log('Part header: k: ' + inspect(h) + ', v: ' + inspect(header[h]));*/
      });
      p.on('data', function (data) {
        callbacks.partData++;
        //console.log('Part data: ' + inspect(data.toString()));
      });
      p.on('end', function () {
        //console.log('End of part\n');
        callbacks.partEnd++;
      });
    });
    d.on('end', function () {
      //console.log('End of parts');
      callbacks.end++;
    });

    d.write(buffer);
  })
  .add('busboy legacy', function () {
    const boundary = '-----------------------------168072824752491622650073',
      d = new BusboyLegacy({
        headers: {
          'content-type': 'multipart/form-data; boundary=' + boundary
        }
      }),
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


    d.on('part', function (p) {
      callbacks.partBegin++;
      p.on('header', function (header) {
        /*for (var h in header)
        console.log('Part header: k: ' + inspect(h) + ', v: ' + inspect(header[h]));*/
      });
      p.on('data', function (data) {
        callbacks.partData++;
        //console.log('Part data: ' + inspect(data.toString()));
      });
      p.on('end', function () {
        //console.log('End of part\n');
        callbacks.partEnd++;
      });
    });
    d.on('end', function () {
      //console.log('End of parts');
      callbacks.end++;
    });

    d.write(buffer);
  })
  .add('parted', function () {
    var Parted = require('./dicer/parted-multipart'),
      boundary = '-----------------------------168072824752491622650073',
      parser = new Parted('boundary=' + boundary),
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

    nparsed = parser.write(buffer);
  })
  .add('formidable', function () {
    const parser = new Formidable(),
      boundary = '-----------------------------168072824752491622650073',
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

    nparsed = parser.write(buffer);
  })
  .add('multipartser', function () {

    const boundary = '-----------------------------168072824752491622650073',
      parser = Multipartser(),
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

    parser.data(buffer);
    parser.end();
  })
  // add listeners
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();

