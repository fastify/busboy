'use strict'

const { Bench } = require('tinybench')
const getopts = require('getopts')

const options = getopts(process.argv.slice(1), {
  alias: {
    preset: 'p'
  },
  default: {}
})

const PRESET = {
  LOW: { iterations: 1000, warmupIterations: 100 },
  MEDIUM: { iterations: 2000, warmupIterations: 100 },
  HIGH: { iterations: 10000, warmupIterations: 1000 }
}

function getCommonBench () {
  const presetId = (options.preset || 'MEDIUM').toUpperCase()
  const preset = PRESET[presetId]
  if (!preset) {
    throw new Error(`Unknown preset: ${presetId}`)
  }
  return new Bench(preset)
}

module.exports = {
  getCommonBench
}
