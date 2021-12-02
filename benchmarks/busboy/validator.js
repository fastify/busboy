const {validateEqual} = require("validation-utils");

const EXPECTED_RESULT = true

async function validateAccuracy(actualResultPromise) {
    const result = await actualResultPromise
    validateEqual(result, EXPECTED_RESULT);
}

module.exports = {
    validateAccuracy
}
