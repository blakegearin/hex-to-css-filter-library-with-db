![Tests](https://img.shields.io/badge/tests-mocha-brightgreen)
![Statements](https://img.shields.io/badge/statements-0%25-red.svg?style=flat)
![Branches](https://img.shields.io/badge/branches-0%25-red.svg?style=flat)
![Functions](https://img.shields.io/badge/functions-0%25-red.svg?style=flat)
![Lines](https://img.shields.io/badge/lines-0%25-red.svg?style=flat)
[![javascript style guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![MIT License](https://img.shields.io/badge/license-MIT%20License-blue.svg)](LICENSE)

# hex-to-css-filter-library-with-db

A JavaScript library to access a [local database](data/hex-to-css-filter-db.sqlite3) of CSS filters to change HTML elements to any hex color code. Not published on NPM due to size. Also mirrored on [GitLab](https://gitlab.com/blakegearin/hex-to-css-filter-library-with-db) in case of bandwidth limits.

## Usage

1. Install the dependency

   - NPM: `npm install https://github.com/blakegearin/hex-to-css-filter-library-with-db#1.0.1`
   - Yarn: `yarn add https://github.com/blakegearin/hex-to-css-filter-library-with-db#1.0.1`

1. Add the dependency into your file

    ```js
    import HexToCssFilterLibraryWithDb from 'hex-to-css-filter-library-with-db'
    ```

1. Fetch a CSS filter or query the database

    ```js
    const filter = new HexToCssFilterLibraryWithDbWithDb().fetchFilter('#42dead')
    ```

## Documentation

### Constructor

```js
const hexToCssFilterLibraryWithDb = new HexToCssFilterLibraryWithDb()

const dbPath = '...'
const hexToCssFilterLibraryWithDb = new HexToCssFilterLibraryWithDb(dbPath)
```

| Parameter |  Type  | Default                                     | Description             |
| --------- | :----: | ------------------------------------------- | ----------------------- |
| `dbPath`  | String | path to `data/hex-to-css-filter-db.sqlite3` | path to SQLite database |

### Fetch Filter

```js
const filter = hexToCssFilterLibraryWithDb.fetchFilter('#42dead')
// invert(66%) sepia(56%) saturate(416%) hue-rotate(110deg) brightness(98%) contrast(100%)

const options = {
  filterPrefix: true,
  preBlacken: true
}
const filter = hexToCssFilterLibraryWithDb.fetchFilter('#42dead', options)
// filter: brightness(0) saturate(1) invert(66%) sepia(56%) saturate(416%) hue-rotate(110deg) brightness(98%) contrast(100%)
```

| Parameter  |  Type  | Description                                                         |
| ---------- | :----: | ------------------------------------------------------------------- |
| `hexColor` | String | case insensitive, valid formats: `#333333`, `#333`, `333`, `333333` |

#### Options

| Name           |  Type   | Default | Description                                    |
| -------------- | :-----: | ------- | ---------------------------------------------- |
| `filterPrefix` | Boolean | `false` | flag for `filter:` inclusion                   |
| `preBlacken`   | Boolean | `false` | flag for `brightness(0) saturate(1)` inclusion |

### Query DB

```js
const sql = 'SELECT COUNT() FROM color'
const response = hexToCssFilterLibraryWithDb.queryDb(sql)
// { 'COUNT()': 16777216 }

const options = { getFirstValue: true }
const response = hexToCssFilterLibrary.queryDb(sql, options)
// 16777216
```

| Parameter |  Type  | Description  |
| --------- | :----: | ------------ |
| `sql`     | String | query to run |

#### Options

| Name            |  Type   | Default | Description                                               |
| --------------- | :-----: | ------- | --------------------------------------------------------- |
| `getFirstValue` | Boolean | `false` | flag for getting the value of the first response property |

## FAQ

- A filter isn't working/accurate, what's going on?

  - The filters in the database assume a starting color of black (#000000). If your HTML element isn't black, you'll need to use the [`preBlacken` option](#options).

- What if I'm not using JavaScript?

  - The code in this package should be easy to port since there's not a lot of logic and SQLite is pretty common.

    - Ruby: [sqlite3-ruby](https://rubygems.org/gems/sqlite3-ruby)
    - Python: [sqlite3](https://docs.python.org/3/library/sqlite3.html)
    - Go: [go-sqlite3](https://pkg.go.dev/github.com/mattn/go-sqlite3)
    - Java: [sqlite-jdbc](https://github.com/xerial/sqlite-jdbc)

- What if I don't want to store the database locally?

  - Use the sister package, [hex-to-css-filter-library](https://www.npmjs.com/package/hex-to-css-filter-library), which calls a [remote copy](https://dbhub.io/blakegearin/hex-to-css-filter-db.sqlite3) of the database.

## About Problem Domain

The current leading method to convert a hex color to a CSS filter is through trial & error with loss minimization.

- Search using [SPSA](https://en.wikipedia.org/wiki/Simultaneous_perturbation_stochastic_approximation) by [MultiplyByZer0 on Stack Overflow](https://stackoverflow.com/a/43960991/5988852)

- NPM package: [hex-to-css-filter](https://github.com/willmendesneto/hex-to-css-filter)

- Brute force with partial color coverage by [Dave on Stack Overflow](https://stackoverflow.com/a/43959856/5988852)

Instead of spending your own time & resources doing this, you can use this library to lookup already calculated [low loss](#loss-statistics) values. Currently all colors have less than **1%** loss.

I don't have plans to process lower values due to diminishing returns. If you are interested in doing this though, please get in touch and I can share my code.

## Database

There are 16,777,216 RGB hex colors. This is equal to 256<sup>3</sup>, with 256 values for red, green, and blue.

Field|Type|Description
-----|----|-----------
`id`|`INTEGER`|primary key, represents the hex color
`sepia`|`INTEGER`|percentage value for the [sepia filter function](https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/sepia)
`saturate`|`INTEGER`|percentage value for the [saturate filter function](https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/saturate)
`hue-rotate`|`INTEGER`|degree value for the [hue-rotate filter function](https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/hue-rotate)
`brightness`|`INTEGER`|percentage value for the [brightness filter function](https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/brightness)
`contrast`|`INTEGER`|percentage value for the [contrast filter function](https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/contrast)
`loss`|`REAL`|percentage value of the filter's loss (lower is better)

For reference: [SQLite datatypes](https://www.sqlite.org/datatype3.html)

### Loss Statistics
