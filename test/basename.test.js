'use strict'

const { test } = require('tap')
const basename = require('../lib/utils/basename')

test('basename', (t) => {
    t.plan(3);

    t.test('returns an empty string if the path is not a string', (t) => {
        const result = basename({});

        t.equal(result, '');
        t.end();
    });

    t.test('returns an empty string if the path includes a \' and the char after is a .', (t) => {
        const result = basename('path\\.');

        t.equal(result, '');
        t.end();
    });

    t.test('returns an empty string if the path is a .', (t) => {
        const result = basename('.');

        t.equal(result, '');
        t.end();
    });
});