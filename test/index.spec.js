import assert from 'assert'
import sinon from 'sinon'

import HexToCssFilterLibraryWithDb from '../index.js'
import DEFAULTS from '../util/defaults.js'

describe('HexToCssFilterLibraryWithDb', () => {
  let hexToCssFilterLibraryWithDb

  describe('constructor()', () => {
    describe('parameters', () => {
      describe('dbPath', () => {
        describe('when not present', () => {
          const dbPath = null

          it('should be set to default value', () => {
            const hexToCssFilterLibraryWithDb = new HexToCssFilterLibraryWithDb()
            assert.equal(hexToCssFilterLibraryWithDb[dbPath], DEFAULTS[dbPath])
          })
        })

        describe('when present', () => {
          describe('when null', () => {
            const dbPath = null

            it('should be set to default value', () => {
              const hexToCssFilterLibraryWithDb = new HexToCssFilterLibraryWithDb(dbPath)
              assert.equal(hexToCssFilterLibraryWithDb[dbPath], DEFAULTS[dbPath])
            })
          })

          describe('when undefined', () => {
            const dbPath = undefined

            it('should be set to default value', () => {
              const hexToCssFilterLibraryWithDb = new HexToCssFilterLibraryWithDb(dbPath)
              assert.equal(hexToCssFilterLibraryWithDb.dbPath, DEFAULTS.dbPath)
            })
          })

          describe('when defined', () => {
            describe('when file exists', () => {
              const dbPath = 'index.js'

              it('should be set to dbPath', () => {
                const hexToCssFilterLibraryWithDb = new HexToCssFilterLibraryWithDb(dbPath)
                assert.equal(hexToCssFilterLibraryWithDb.dbPath, dbPath)
              })
            })

            describe('when file does not exist', () => {
              const dbPath = 'nonexistentFile.txt'

              it('should throw error', () => {
                assert.throws(() => new HexToCssFilterLibraryWithDb(dbPath))
              })
            })
          })
        })
      })
    })
  })

  describe('queryDb()', () => {
    beforeEach(() => {
      hexToCssFilterLibraryWithDb = new HexToCssFilterLibraryWithDb()
    })

    describe('parameters', () => {
      describe('sql', () => {
        describe('when null', () => {
          const sql = null

          it('should throw error', () => {
            assert.throws(() => hexToCssFilterLibraryWithDb.queryDb(sql))
          })
        })

        describe('when undefined', () => {
          const sql = undefined

          it('should throw error', () => {
            assert.throws(() => hexToCssFilterLibraryWithDb.queryDb(sql))
          })
        })

        describe('when defined', () => {
          describe('when a valid query', () => {
            const sql = 'SELECT COUNT() FROM color'
            const expectedResponse = { 'COUNT()': 16777216 }

            it('should return response from database', () => {
              const response = hexToCssFilterLibraryWithDb.queryDb(sql)
              assert.deepEqual(response, expectedResponse)
            })
          })

          describe('when an invalid query', () => {
            const sql = 'SELECT COUNT() FROM nonexistentTable'

            it('should throw error', () => {
              assert.throws(() => hexToCssFilterLibraryWithDb.queryDb(sql))
            })
          })
        })
      })
    })

    describe('options', () => {
      describe('getFirstValue', () => {
        const sql = 'SELECT COUNT() FROM color'
        const stubbedResponse = 'stubbedResponse'

        describe('when null', () => {
          const options = {
            getFirstValue: null
          }

          beforeEach(() => {
            const stubbedPrepare = {
              get () { return stubbedResponse }
            }
            sinon.stub(hexToCssFilterLibraryWithDb.db, 'prepare').returns(stubbedPrepare)
          })

          it('should be set to default value', () => {
            const response = hexToCssFilterLibraryWithDb.queryDb(sql, options)
            assert.equal(response, stubbedResponse)
          })
        })

        describe('when undefined', () => {
          const options = {
            getFirstValue: undefined
          }

          beforeEach(() => {
            const stubbedPrepare = {
              get () { return stubbedResponse }
            }
            sinon.stub(hexToCssFilterLibraryWithDb.db, 'prepare').returns(stubbedPrepare)
          })

          it('should be set to default value', () => {
            const response = hexToCssFilterLibraryWithDb.queryDb(sql, options)
            assert.equal(response, stubbedResponse)
          })
        })

        describe('when true', () => {
          const options = {
            getFirstValue: true
          }

          describe('when the call\'s returns an object', () => {
            const expectedResponse = 'stubbedResponse'
            const stubbedResponse = {
              data: expectedResponse
            }

            beforeEach(() => {
              const stubbedPrepare = {
                get () { return stubbedResponse }
              }
              sinon.stub(hexToCssFilterLibraryWithDb.db, 'prepare').returns(stubbedPrepare)
            })

            it('returns first property of the object', () => {
              const response = hexToCssFilterLibraryWithDb.queryDb(sql, options)
              assert.equal(response, expectedResponse)
            })
          })

          describe('when the call\'s does not return an object', () => {
            const expectedResponse = 'stubbedResponse'
            const stubbedResponse = expectedResponse

            beforeEach(() => {
              const stubbedPrepare = {
                get () { return stubbedResponse }
              }
              sinon.stub(hexToCssFilterLibraryWithDb.db, 'prepare').returns(stubbedPrepare)
            })

            it('returns the original call\'s return value', () => {
              const response = hexToCssFilterLibraryWithDb.queryDb(sql, options)
              assert.equal(response, expectedResponse)
            })
          })
        })
      })
    })
  })

  describe('fetchFilter()', () => {
    beforeEach(() => {
      hexToCssFilterLibraryWithDb = new HexToCssFilterLibraryWithDb()
    })

    describe('parameters', () => {
      describe('hexColor', () => {
        describe('when null', () => {
          const hexColor = null

          it('should throw error', () => {
            assert.throws(() => hexToCssFilterLibraryWithDb.fetchFilter(hexColor))
          })
        })

        describe('when undefined', () => {
          const hexColor = undefined

          it('should throw error', () => {
            assert.throws(() => hexToCssFilterLibraryWithDb.fetchFilter(hexColor))
          })
        })

        describe('when defined', () => {
          describe('when queryDb() response is null', () => {
            const hexColor = '#333'

            beforeEach(() => {
              sinon.stub(hexToCssFilterLibraryWithDb, 'queryDb').returns(null)
            })

            it('should throw error', () => {
              assert.throws(() => hexToCssFilterLibraryWithDb.fetchFilter(hexColor))
            })
          })

          describe('when queryDb() response is not null', () => {
            describe('when hex digit amount is not 3 or 6', () => {
              describe('with hash', () => {
                const hexColor = '#3333'

                it('should throw error', () => {
                  assert.throws(() => hexToCssFilterLibraryWithDb.fetchFilter(hexColor))
                })
              })

              describe('without hash', () => {
                const hexColor = '3333'

                it('should throw error', () => {
                  assert.throws(() => hexToCssFilterLibraryWithDb.fetchFilter(hexColor))
                })
              })
            })

            describe('when hex digit amount is 3 or 6', () => {
              describe('when filter has no values that are 0', () => {
                const stubbedResponse = {
                  id: 4382381,
                  invert: 21,
                  sepia: 56,
                  saturate: 416,
                  'hue-rotate': 110,
                  brightness: 98,
                  contrast: 100,
                  loss: 0.2578769732
                }
                const expectedResponse = 'invert(21%) sepia(56%) saturate(416%) hue-rotate(110deg) brightness(98%) contrast(100%)'

                beforeEach(() => {
                  sinon.stub(hexToCssFilterLibraryWithDb, 'queryDb').returns(stubbedResponse)
                })

                describe('when 3-digit hex', () => {
                  describe('with hash', () => {
                    const hexColor = '#333'

                    it('should make a call to the database and return filter', () => {
                      const filter = hexToCssFilterLibraryWithDb.fetchFilter(hexColor)
                      assert.equal(filter, expectedResponse)
                    })
                  })

                  describe('without hash', () => {
                    const hexColor = '333'

                    it('should make a call to the database and return filter', () => {
                      const filter = hexToCssFilterLibraryWithDb.fetchFilter(hexColor)
                      assert.equal(filter, expectedResponse)
                    })
                  })
                })

                describe('when 6-digit hex', () => {
                  describe('with hash', () => {
                    const hexColor = '#333333'

                    it('should make a call to the database and return filter', () => {
                      const filter = hexToCssFilterLibraryWithDb.fetchFilter(hexColor)
                      assert.equal(filter, expectedResponse)
                    })
                  })

                  describe('without hash', () => {
                    const hexColor = '333333'

                    it('should make a call to the database and return filter', () => {
                      const filter = hexToCssFilterLibraryWithDb.fetchFilter(hexColor)
                      assert.equal(filter, expectedResponse)
                    })
                  })
                })
              })

              describe('when filter has a value that is 0', () => {
                const hexColor = '333'
                const stubbedResponse = {
                  id: 4382381,
                  invert: 21,
                  sepia: 56,
                  saturate: 416,
                  'hue-rotate': 110,
                  brightness: 0,
                  contrast: 100,
                  loss: 0.2578769732
                }
                const expectedResponse = 'invert(21%) sepia(56%) saturate(416%) hue-rotate(110deg) contrast(100%)'

                beforeEach(() => {
                  sinon.stub(hexToCssFilterLibraryWithDb, 'queryDb').returns(stubbedResponse)
                })

                it('should exclude value from filter', () => {
                  const filter = hexToCssFilterLibraryWithDb.fetchFilter(hexColor)
                  assert.equal(filter, expectedResponse)
                })
              })
            })
          })
        })
      })
    })

    describe('options', () => {
      const hexColor = '#333333'
      const stubbedResponse = {
        id: 4382381,
        invert: 21,
        sepia: 56,
        saturate: 416,
        'hue-rotate': 110,
        brightness: 98,
        contrast: 100,
        loss: 0.2578769732
      }

      beforeEach(() => {
        sinon.stub(hexToCssFilterLibraryWithDb, 'queryDb').returns(stubbedResponse)
      })

      describe('filterPrefix', () => {
        const expectedResponse = 'invert(21%) sepia(56%) saturate(416%) hue-rotate(110deg) brightness(98%) contrast(100%)'

        describe('when null', () => {
          it('should return the filter without prefix', () => {
            const options = {
              filterPrefix: null
            }
            const filter = hexToCssFilterLibraryWithDb.fetchFilter(hexColor, options)
            assert.equal(filter, expectedResponse)
          })
        })

        describe('when undefined', () => {
          it('should return the filter without prefix', () => {
            const options = {
              filterPrefix: undefined
            }
            const filter = hexToCssFilterLibraryWithDb.fetchFilter(hexColor, options)
            assert.equal(filter, expectedResponse)
          })
        })

        describe('when true', () => {
          const expectedResponse = 'filter: invert(21%) sepia(56%) saturate(416%) hue-rotate(110deg) brightness(98%) contrast(100%)'

          it('should prefix filter with \'filter:\'', () => {
            const options = {
              filterPrefix: true
            }
            const filter = hexToCssFilterLibraryWithDb.fetchFilter(hexColor, options)
            assert.equal(filter, expectedResponse)
          })
        })
      })

      describe('preBlacken', () => {
        const expectedResponse = 'invert(21%) sepia(56%) saturate(416%) hue-rotate(110deg) brightness(98%) contrast(100%)'

        describe('when null', () => {
          it('should return the filter without prefix', () => {
            const options = {
              preBlacken: null
            }
            const filter = hexToCssFilterLibraryWithDb.fetchFilter(hexColor, options)
            assert.equal(filter, expectedResponse)
          })
        })

        describe('when undefined', () => {
          it('should return the filter without prefix', () => {
            const options = {
              preBlacken: undefined
            }
            const filter = hexToCssFilterLibraryWithDb.fetchFilter(hexColor, options)
            assert.equal(filter, expectedResponse)
          })
        })

        describe('when true', () => {
          const expectedResponse = 'brightness(0) saturate(1) invert(21%) sepia(56%) saturate(416%) hue-rotate(110deg) brightness(98%) contrast(100%)'

          it('should prefix filter with brightness(0) saturate(1)', () => {
            const options = {
              preBlacken: true
            }
            const filter = hexToCssFilterLibraryWithDb.fetchFilter(hexColor, options)
            assert.equal(filter, expectedResponse)
          })
        })
      })
    })
  })
})
