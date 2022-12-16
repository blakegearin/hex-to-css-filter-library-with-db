import fs from 'fs'
import * as dotenv from 'dotenv'
import HexToCssFilterLibraryWithDb from '../index.js'

dotenv.config()

const tableName = 'color'

// Credit: https://stackoverflow.com/a/11818658/5988852
function toFixed (num, fixed) {
  const regex = new RegExp('^-?\\d+(?:.\\d{0,' + (fixed || -1) + '})?')
  return num.toString().match(regex)[0]
}

const getLossesEqualToQuery = (value) => `
  SELECT COUNT() FROM ${tableName} WHERE LOSS == ${value} ORDER BY loss DESC
`
const getLossesBetweenQuery = (lowerValueInclusive, upperValueExclusive) => `
  SELECT COUNT() FROM ${tableName}
  WHERE ${lowerValueInclusive} <= LOSS AND LOSS < ${upperValueExclusive}
  ORDER BY loss DESC
`

const hexToCssFilterLibraryWithDb = new HexToCssFilterLibraryWithDb()

const average = toFixed(
  await hexToCssFilterLibraryWithDb.queryDb(
    `SELECT AVG(loss) FROM ${tableName}`,
    { getFirstValue: true }
  ),
  5
)
const max = toFixed(
  await hexToCssFilterLibraryWithDb.queryDb(
    `SELECT MAX(loss) FROM ${tableName}`,
    { getFirstValue: true }
  ),
  5
)
const min = toFixed(
  await hexToCssFilterLibraryWithDb.queryDb(
    // Ignore 0 since that's #000000 which needs no filter
    `SELECT MIN(loss) FROM ${tableName} WHERE ID != 0`,
    { getFirstValue: true }
  ),
  5
)
const count = parseInt(await hexToCssFilterLibraryWithDb.queryDb(
  `SELECT COUNT() FROM ${tableName}`,
  { getFirstValue: true }
))

const perfects = parseInt(await hexToCssFilterLibraryWithDb.queryDb(
  getLossesEqualToQuery(0),
  { getFirstValue: true }
))
const below01s = parseInt(await hexToCssFilterLibraryWithDb.queryDb(
  getLossesBetweenQuery(0, 0.1),
  { getFirstValue: true }
)) - perfects
const below02s = parseInt(await hexToCssFilterLibraryWithDb.queryDb(
  getLossesBetweenQuery(0.1, 0.2),
  { getFirstValue: true }
))
const below03s = parseInt(await hexToCssFilterLibraryWithDb.queryDb(
  getLossesBetweenQuery(0.2, 0.3),
  { getFirstValue: true }
))
const below04s = parseInt(await hexToCssFilterLibraryWithDb.queryDb(
  getLossesBetweenQuery(0.3, 0.4),
  { getFirstValue: true }
))
const below05s = parseInt(await hexToCssFilterLibraryWithDb.queryDb(
  getLossesBetweenQuery(0.4, 0.5),
  { getFirstValue: true }
))
const below06s = parseInt(await hexToCssFilterLibraryWithDb.queryDb(
  getLossesBetweenQuery(0.5, 0.6),
  { getFirstValue: true }
))
const below07s = parseInt(await hexToCssFilterLibraryWithDb.queryDb(
  getLossesBetweenQuery(0.6, 0.7),
  { getFirstValue: true }
))
const below08s = parseInt(await hexToCssFilterLibraryWithDb.queryDb(
  getLossesBetweenQuery(0.7, 0.8),
  { getFirstValue: true }
))
const below09s = parseInt(await hexToCssFilterLibraryWithDb.queryDb(
  getLossesBetweenQuery(0.8, 0.9),
  { getFirstValue: true }
))
const below1s = parseInt(await hexToCssFilterLibraryWithDb.queryDb(
  getLossesBetweenQuery(0.9, 1),
  { getFirstValue: true }
))

const tableData = [
  average,
  max,
  min,
  perfects.toLocaleString(),
  below01s.toLocaleString(),
  below02s.toLocaleString(),
  below03s.toLocaleString(),
  below04s.toLocaleString(),
  below05s.toLocaleString(),
  below06s.toLocaleString(),
  below07s.toLocaleString(),
  below08s.toLocaleString(),
  below09s.toLocaleString(),
  below1s.toLocaleString(),
  count.toLocaleString()
]
const tableHeader = `
Average|Max|Min|0%|0.0%|0.1%|0.2%|0.3%|0.4%|0.5%|0.6%|0.7%|0.8%|0.9%|Total
-------|---|---|--|----|----|----|----|----|----|----|----|----|----|-----`
const table = tableHeader + `\n${tableData.join('|')}`

fs.readFile('docs/README_template.md', 'utf8', function (err, data) {
  if (err) return console.error(err)

  const pieChart = `

\`\`\`mermaid
pie showData
"0% loss" : ${perfects}
"0.0% loss" : ${below01s}
"0.1% loss" : ${below02s}
"0.2% loss" : ${below03s}
"0.3% loss" : ${below04s}
"0.4% loss" : ${below05s}
"0.5% loss" : ${below06s}
"0.6% loss" : ${below07s}
"0.7% loss" : ${below08s}
"0.8% loss" : ${below09s}
"0.9% loss" : ${below1s}
\`\`\`
`

  data += table
  data += pieChart

  fs.writeFile('README.md', data, (err) => {
    if (err) console.log(err)
  })
})
