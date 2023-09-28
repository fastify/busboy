'use strict'

const parseParams = require('../lib/utils/parseParams')
const { Bench } = require('tinybench');
const bench = new Bench();

const simple = 'video/ogg'
const complex = "'text/plain; filename*=utf-8''%c2%a3%20and%20%e2%82%ac%20rates'"

bench
  .add(simple, function () { parseParams(simple) })
  .add(complex, function () { parseParams(complex) })
  .run()
  .then((tasks) => {
    const errors = tasks.map(t => t.result?.error).filter((t) => t)
    if (errors.length) {
      errors.map((e) => console.error(e))
    } else {
      console.table(bench.table())
    }
  })
