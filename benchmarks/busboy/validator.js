'use strict'

const assert = require('node:assert')
const { randomContent } = require('./data')

const EXPECTED_RESULT = randomContent.toString()

async function validateAccuracy (actualResultPromise) {
  const result = await actualResultPromise
  assert.strictEqual(result, EXPECTED_RESULT)
}

module.exports = {
  validateAccuracy
}
