'use strict'

const { validateNotNil } = require('validation-utils')
const { BenchmarkBuilder } = require('photofinish')
const getopts = require('getopts')

const options = getopts(process.argv.slice(1), {
  alias: {
    preset: 'p'
  },
  default: {}
})

const PRESET = {
  LOW: (builder) => {
    return builder.warmupCycles(5).benchmarkCycles(50)
  },

  MEDIUM: (builder) => {
    return builder.warmupCycles(10).benchmarkCycles(100)
  },

  HIGH: (builder) => {
    return builder.warmupCycles(50).benchmarkCycles(500)
  }
}

function getCommonBuilder () {
  const presetId = options.preset || 'MEDIUM'
  const preset = validateNotNil(
    PRESET[presetId.toUpperCase()],
    `Unknown preset: ${presetId}`
  )

  const builder = new BenchmarkBuilder()
  preset(builder)
  return builder.benchmarkCycleSamples(50)
}

module.exports = {
  getCommonBuilder
}
