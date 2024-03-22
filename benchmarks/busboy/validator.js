'use strict'

const { validateEqual } = require('validation-utils')
const { fileContent, fileCount, fieldContent, fieldCount } = require('./data')

const EXPECTED_RESULT = (fileContent.length * fileCount) + (fieldContent.length * fieldCount)

async function validateAccuracy (actualResultPromise) {
  const [result, parts] = await actualResultPromise
  validateEqual(result, EXPECTED_RESULT)
  validateEqual(parts, fileCount + fieldCount)
}

module.exports = {
  validateAccuracy
}
