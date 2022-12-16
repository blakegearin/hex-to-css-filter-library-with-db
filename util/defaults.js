import { fileURLToPath } from 'url'
import path, { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default Object.freeze({
  dbPath: path.resolve(__dirname, '../data/hex-to-css-filter-db.sqlite3'),
  getFirstValue: false
})
