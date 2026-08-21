'use strict'

const fs = require('node:fs')
const path = require('node:path')

function outputResults (name, bench) {
  const task = bench.tasks.find(t => t.name === name)
  if (task && task.result) {
    console.log(
      `Mean time for ${name} is ${Math.round(task.result.mean * 1e6)} nanoseconds`
    )
  }

  const resultsDir = path.resolve('_results')
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true })
  }

  const results = bench.tasks.map(t => ({
    name: t.name,
    meanTimeNs: t.result ? Math.round(t.result.mean * 1e6) : null,
    opsPerSecond: t.result ? Math.round(t.result.hz) : null
  }))

  fs.writeFileSync(
    path.resolve(resultsDir, `${name}.json`),
    JSON.stringify(results, null, 2)
  )
}

module.exports = {
  outputResults
}
