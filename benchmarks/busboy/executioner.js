'use strict'

const { process: processBusboy } = require('./contestants/busboy')
const { process: processFastify } = require('./contestants/fastify-busboy')
const { process: processMultipasta } = require('./contestants/multipasta')
const { getCommonBuilder } = require('../common/commonBuilder')
const { validateAccuracy } = require('./validator')
const { resolveContestant } = require('../common/contestantResolver')
const { outputResults } = require('../common/resultUtils')

const contestants = {
  busboy: measureBusboy,
  fastify: measureFastify,
  multipasta: measureMultipasta
}

async function measureBusboy () {
  const benchmark = getCommonBuilder()
    .benchmarkName('Busboy comparison')
    .benchmarkEntryName('busboy')
    .asyncFunctionUnderTest(processBusboy)
    .build()
  const benchmarkResults = await benchmark.executeAsync()
  outputResults(benchmark, benchmarkResults)
}

async function measureFastify () {
  const benchmark = getCommonBuilder()
    .benchmarkName('Busboy comparison')
    .benchmarkEntryName('fastify-busboy')
    .asyncFunctionUnderTest(processFastify)
    .build()
  const benchmarkResults = await benchmark.executeAsync()
  outputResults(benchmark, benchmarkResults)
}

async function measureMultipasta () {
  const benchmark = getCommonBuilder()
    .benchmarkName('Busboy comparison')
    .benchmarkEntryName('multipasta')
    .asyncFunctionUnderTest(processMultipasta)
    .build()
  const benchmarkResults = await benchmark.executeAsync()
  outputResults(benchmark, benchmarkResults)
}

function execute () {
  return validateAccuracy(processBusboy())
    .then(() => {
      return validateAccuracy(processFastify())
    })
    .then(() => {
      const contestant = resolveContestant(contestants)
      return contestant()
    }).then(() => {
      console.log('all done')
    }).catch((err) => {
      console.error('Something went wrong', err)
    })
}

execute()
