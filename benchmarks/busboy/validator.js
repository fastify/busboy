'use strict'

const { validateEqual } = require('validation-utils')
const { fileContent, fileCount, fieldContent, fieldCount } = require('./data')

const EXPECTED_RESULT = (fileContent.length * fileCount) + (fieldContent.length * fieldCount)

async function validateAccuracy (actualResultPromise) {
  const result = await actualResultPromise
  validateEqual(result, EXPECTED_RESULT)
}

module.exports = {
  validateAccuracy
}
