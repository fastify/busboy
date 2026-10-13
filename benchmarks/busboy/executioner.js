'use strict'

const { process: processBusboy } = require('./contestants/busboy')
const { process: processFastify } = require('./contestants/fastify-busboy')
const { getCommonBench } = require('../common/commonBuilder')
const { validateAccuracy } = require('./validator')
const { resolveContestant } = require('../common/contestantResolver')
const { outputResults } = require('../common/resultUtils')

const contestants = {
  busboy: measureBusboy,
  fastify: measureFastify
}

async function measureBusboy () {
  const bench = getCommonBench()
  bench.add('busboy', processBusboy)
  await bench.run()
  console.table(bench.table())
  outputResults('busboy', bench)
}

async function measureFastify () {
  const bench = getCommonBench()
  bench.add('fastify-busboy', processFastify)
  await bench.run()
  console.table(bench.table())
  outputResults('fastify-busboy', bench)
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
      console.error(`Something went wrong: ${err.message}`)
    })
}

execute()
