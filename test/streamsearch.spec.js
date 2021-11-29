const { expect } = require('chai');
const Streamsearch = require('../deps/streamsearch/sbmh');

describe('streamsearch', () => {
    it('should process a Buffer without a needle', (done) => {
        const expected = [
            [false, Buffer.from("bar hello"), 0, 9],
        ]
        const needle = "\r\n";
        const s = new Streamsearch(needle);
        const chunks = [
            Buffer.from('bar hello'),
        ];
        let i = 0;
        s.on('info', (isMatched, data, start, end) => {
            expect(isMatched).to.be.eql(expected[i][0]);
            expect(data).to.be.eql(expected[i][1]);
            expect(start).to.be.eql(expected[i][2]);
            expect(end).to.be.eql(expected[i][3]);
            i++;
            if (i === 1) {
                done();
            }
        });

        s.push(chunks[0]);
    });
    it('should cast a string without a needle', (done) => {
        const expected = [
            [false, Buffer.from("bar hello"), 0, 9],
        ]
        const needle = "\r\n";
        const s = new Streamsearch(needle);
        const chunks = [
            'bar hello',
        ];
        let i = 0;
        s.on('info', (isMatched, data, start, end) => {
            expect(isMatched).to.be.eql(expected[i][0]);
            expect(data).to.be.eql(expected[i][1]);
            expect(start).to.be.eql(expected[i][2]);
            expect(end).to.be.eql(expected[i][3]);
            i++;
            if (i === 1) {
                done();
            }
        });

        s.push(chunks[0]);
    });
    it('should process a chunk with a needle at the beginning', (done) => {
        const expected = [
            [true, undefined, undefined, undefined],
            [false, Buffer.from("\r\nbar hello"), 2, 11],
        ]
        const needle = "\r\n";
        const s = new Streamsearch(needle);
        const chunks = [
            Buffer.from('\r\nbar hello'),
        ];
        let i = 0;
        s.on('info', (isMatched, data, start, end) => {
            expect(isMatched).to.be.eql(expected[i][0]);
            expect(data).to.be.eql(expected[i][1]);
            expect(start).to.be.eql(expected[i][2]);
            expect(end).to.be.eql(expected[i][3]);
            i++;
            if (i === 2) {
                done();
            }
        });

        s.push(chunks[0]);
    });

    it('should process a chunk with a needle in the middle', (done) => {
        const expected = [
            [true, Buffer.from("bar\r\n hello"), 0, 3],
            [false, Buffer.from("bar\r\n hello"), 5, 11],
        ]
        const needle = "\r\n";
        const s = new Streamsearch(needle);
        const chunks = [
            Buffer.from('bar\r\n hello'),
        ];
        let i = 0;
        s.on('info', (isMatched, data, start, end) => {
            expect(isMatched).to.be.eql(expected[i][0]);
            expect(data).to.be.eql(expected[i][1]);
            expect(start).to.be.eql(expected[i][2]);
            expect(end).to.be.eql(expected[i][3]);
            i++;
            if (i === 2) {
                done();
            }
        });

        s.push(chunks[0]);
    });

    it('should process a chunk with a needle at the end', (done) => {
        const expected = [
            [true, Buffer.from("bar hello\r\n"), 0, 9],
        ]
        const needle = "\r\n";
        const s = new Streamsearch(needle);
        const chunks = [
            Buffer.from('bar hello\r\n'),
        ];
        let i = 0;
        s.on('info', (isMatched, data, start, end) => {
            expect(isMatched).to.be.eql(expected[i][0]);
            expect(data).to.be.eql(expected[i][1]);
            expect(start).to.be.eql(expected[i][2]);
            expect(end).to.be.eql(expected[i][3]);
            i++;
            if (i === 1) {
                done();
            }
        });

        s.push(chunks[0]);
    });

    it('should process a chunk with multiple needle at the end', (done) => {
        const expected = [
            [true, Buffer.from("bar hello\r\n\r\n"), 0, 9],
            [true, Buffer.from("bar hello\r\n\r\n"), 11, 11],
        ]
        const needle = "\r\n";
        const s = new Streamsearch(needle);
        const chunks = [
            Buffer.from('bar hello\r\n\r\n'),
        ];
        let i = 0;
        s.on('info', (isMatched, data, start, end) => {
            expect(isMatched).to.be.eql(expected[i][0]);
            expect(data).to.be.eql(expected[i][1]);
            expect(start).to.be.eql(expected[i][2]);
            expect(end).to.be.eql(expected[i][3]);
            i++;
            if (i === 2) {
                done();
            }
        });

        s.push(chunks[0]);
    });

    it('should process two chunks without a needle', (done) => {
        const expected = [
            [false, Buffer.from("bar"), 0, 3],
            [false, Buffer.from("hello"), 0, 5],
        ]
        const needle = "\r\n";
        const s = new Streamsearch(needle);
        const chunks = [
            Buffer.from('bar'),
            Buffer.from('hello'),
        ];
        let i = 0;
        s.on('info', (isMatched, data, start, end) => {
            expect(isMatched).to.be.eql(expected[i][0]);
            expect(data).to.be.eql(expected[i][1]);
            expect(start).to.be.eql(expected[i][2]);
            expect(end).to.be.eql(expected[i][3]);
            i++;
            if (i === 2) {
                done();
            }
        });

        s.push(chunks[0]);
        s.push(chunks[1]);
    });

    it('should process two chunks with an overflowing needle', (done) => {
        const expected = [
            [false, Buffer.from("bar\r"), 0, 3],
            [true, undefined, undefined, undefined],
            [false, Buffer.from("\nhello"), 1, 6],
        ]
        const needle = "\r\n";
        const s = new Streamsearch(needle);
        const chunks = [
            Buffer.from('bar\r'),
            Buffer.from('\nhello'),
        ];
        let i = 0;
        s.on('info', (isMatched, data, start, end) => {
            expect(isMatched).to.be.eql(expected[i][0]);
            expect(data).to.be.eql(expected[i][1]);
            expect(start).to.be.eql(expected[i][2]);
            expect(end).to.be.eql(expected[i][3]);
            i++;
            if (i === 3) {
                done();
            }
        });

        s.push(chunks[0]);
        s.push(chunks[1]);
    });

    it('should process two chunks with a potentially overflowing needle', (done) => {
        const expected = [
            [false, Buffer.from("bar\r"), 0, 3],
            [false, Buffer.from("\r\0\0"), 0, 1],
            [false, Buffer.from("\n\r\nhello"), 0, 8],
        ]
        const needle = "\r\n\n";
        const s = new Streamsearch(needle);
        const chunks = [
            Buffer.from('bar\r'),
            Buffer.from('\n\r\nhello'),
        ];
        let i = 0;
        s.on('info', (isMatched, data, start, end) => {
            expect(isMatched).to.be.eql(expected[i][0]);
            expect(data).to.be.eql(expected[i][1]);
            expect(start).to.be.eql(expected[i][2]);
            expect(end).to.be.eql(expected[i][3]);
            i++;
            if (i === 3) {
                done();
            }
        });

        s.push(chunks[0]);
        s.push(chunks[1]);
    });

    it('should process three chunks with a overflowing needle', (done) => {
        const expected = [
            [false, Buffer.from("bar\r"), 0, 3],
            [true, undefined, undefined, undefined],
            [false, Buffer.from("\nhello"), 1, 6],
        ]
        const needle = "\r\n\n";
        const s = new Streamsearch(needle);
        const chunks = [
            Buffer.from('bar\r'),
            Buffer.from('\n'),
            Buffer.from('\nhello'),
        ];
        let i = 0;
        s.on('info', (isMatched, data, start, end) => {
            expect(isMatched).to.be.eql(expected[i][0]);
            expect(data).to.be.eql(expected[i][1]);
            expect(start).to.be.eql(expected[i][2]);
            expect(end).to.be.eql(expected[i][3]);
            i++;
            if (i === 3) {
                done();
            }
        });

        s.push(chunks[0]);
        s.push(chunks[1]);
        s.push(chunks[2]);
    });
})
