const { validateNotNil } = require('validation-utils')
const { BenchmarkBuilder } = require("photofinish");
const getopts = require("getopts");

const options = getopts(process.argv.slice(1), {
  alias: {
    preset: "p",
  },
  default: {},
});

const PRESET = {
  LOW: (builder) => {
    return builder
        .warmupCycles(10)
        .benchmarkCycles(20)
  },

  MEDIUM: (builder) => {
    return builder
        .warmupCycles(100)
        .benchmarkCycles(200)
  },

  HIGH: (builder) => {
    return builder
        .warmupCycles(1000)
        .benchmarkCycles(2000)
  },
}

function getCommonBuilder() {
  const presetId = options.preset || 'LOW';
  const preset = validateNotNil(PRESET[presetId.toUpperCase()], `Unknown preset: ${presetId}`);

  const builder = new BenchmarkBuilder();
  preset(builder);
  return builder
      .benchmarkCycleSamples(50);
}

module.exports = {
  getCommonBuilder,
};
