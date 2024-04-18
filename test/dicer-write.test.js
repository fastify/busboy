'use strict'

const { test } = require('tap')
const { Dicer } = require('../lib/main')

test('dicer _write method', t => {
    t.plan(1);

    t.test('the PartStream instance is created only once if the _write method is called more than once', t => {
        const dicer = new Dicer({headerFirst: true});

        dicer._write(Buffer.from('Content-Type: text/plain'), null, () => {
            dicer._write(Buffer.from('Content-Type: text/plain'), null, () => {
                t.pass('write method called');
            });
        });

        t.end();
    });
});
