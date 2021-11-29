const Dicer = require('../deps/dicer/lib/Dicer');

describe('dicer-malformed-header', () => {

  it("should gracefully handle headers with leading whitespace", done => {
    var inspect = require('util').inspect;
    var d = new Dicer({ boundary: "----WebKitFormBoundaryoo6vortfDzBsDiro" });

    d.on('part', function (p) {
      p.on('header', function (header) {
        for (var h in header) {
          console.log('Part header: k: ' + inspect(h)
            + ', v: ' + inspect(header[h]));
        }
      });
      p.on('data', function (data) {
      });
      p.on('end', function () {
      });
    });
    d.on('finish', function () {
      done();
    });

    d.write(Buffer.from('------WebKitFormBoundaryoo6vortfDzBsDiro\r\n Content-Disposition: form-data; name="bildbeschreibung"\r\n\r\n\r\n------WebKitFormBoundaryoo6vortfDzBsDiro--'));
  }).timeout(10000);
});
