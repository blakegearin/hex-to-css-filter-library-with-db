import Database from 'better-sqlite3'
import fs from 'fs'

import DEFAULTS from './util/defaults.js'

export default class HexToCssFilterLibraryWithDb {
  constructor (dbPath = null) {
    this.dbPath = dbPath || DEFAULTS.dbPath

    if (!fs.existsSync(this.dbPath)) throw new Error(`dbPath does not exist: ${this.dbPath}`)

    this.db = new Database(this.dbPath)
  }

  queryDb (sql, options = {}) {
    if (sql == null) throw new Error('Required parameter sql is not present')

    const getFirstValue = options.getFirstValue || DEFAULTS.getFirstValue

    const response = this.db.prepare(sql).get()

    if (getFirstValue && typeof response === 'object') return Object.values(response)[0]

    return response
  }

  fetchFilter (hexColor, options = {}) {
    if (hexColor == null) throw new Error('Required parameter hexColor is not present')

    if (
      (hexColor.length === 3 && hexColor.charAt(0) !== '#') ||
      (hexColor.length === 4 && hexColor.charAt(0) === '#')
    ) {
      hexColor = hexColor.replace(/(\w)(\w)(\w)/g, '$1$1$2$2$3$3')
    }

    const validHexColor = /^#?[0-9a-f]{6}$/i.test(hexColor)
    if (!validHexColor) throw new Error(`Hex color is not valid: ${hexColor}`)

    const filterPrefix = options.filterPrefix || false
    const preBlacken = options.preBlacken || false

    const hexColorInt = parseInt(hexColor.replace('#', ''), 16)

    const response = this.queryDb(
      `SELECT * FROM 'color' WHERE ID = ${hexColorInt}`,
      options
    )

    if (response === null) {
      const error =
        `Color not found in database | hex: ${this.hexColor} | integer: ${hexColorInt}`
      throw new Error(error)
    }

    const filterArray = []
    if (filterPrefix) filterArray.push('filter:')
    if (preBlacken) filterArray.push('brightness(0) saturate(1)')

    for (const [key, value] of Object.entries(response)) {
      if (value === 0) continue

      let valueUnit

      switch (key) {
        case 'id':
        case 'loss':
          continue
        case 'hue-rotate':
          valueUnit = 'deg'
          break
        default:
          valueUnit = '%'
      }

      // Convert from { invert: "50" } to "invert(50%)"
      filterArray.push(`${key}(${value}${valueUnit})`)
    }

    this.filter = filterArray.join(' ')
    return this.filter
  }
}
