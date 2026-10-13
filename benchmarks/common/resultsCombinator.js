'use strict'

const fs = require('node:fs')
const path = require('node:path')
const getopts = require('getopts')

const options = getopts(process.argv.slice(1), {
  alias: {
    resultsDir: 'r',
    precision: 'p'
  },
  default: {
    precision: 6
  }
})

async function saveTable () {
  const baseResultsDir = options.resultsDir
  const files = fs.readdirSync(baseResultsDir).filter(f => f.endsWith('.json'))

  const allResults = []
  for (const file of files) {
    const content = JSON.parse(fs.readFileSync(path.resolve(baseResultsDir, file), 'utf8'))
    allResults.push(...content)
  }

  const precision = Number(options.precision)
  const lines = ['| Name | Mean Time (ns) | Ops/sec |', '|------|---------------|---------|']
  for (const r of allResults.sort((a, b) => (a.meanTimeNs || 0) - (b.meanTimeNs || 0))) {
    lines.push(`| ${r.name} | ${r.meanTimeNs?.toFixed(precision) ?? 'N/A'} | ${r.opsPerSecond ?? 'N/A'} |`)
  }

  const table = lines.join('\n')
  console.log(table)

  const targetFilePath = path.resolve(baseResultsDir, 'results.md')
  fs.writeFileSync(targetFilePath, table)
}

saveTable()
