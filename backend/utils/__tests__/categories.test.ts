import {describe, expect, test, jest, beforeEach} from "@jest/globals"
import { getAllCategories } from "../categories"

const mockArtworkFind = jest.fn()
jest.mock('../../models/artwork', () => ({
    find: () => mockArtworkFind()
}))

const mockCollectionFind = jest.fn()
jest.mock('../../models/collection', () => ({
    find: () => mockCollectionFind()
}))

describe('categories util functions tests', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    test.each([
        {
            testName: 'getAllColletions test - artworks present in collection',
            artworkFind: () => {return {exec: () => Promise.resolve([
                {
                  _id: "6717d4c0666e8575d873ee69",
                  createdAt: '2024-10-22T20:12:12.209Z',
                  updatedAt: '2024-10-22T20:12:12.209Z',
                  __v: 0,
                  categories: [
                    {
                      name: 'Tytuł',
                      values: [ 'testowy' ],
                      subcategories: [
                        {
                          name: 'Podtytuł',
                          values: [ 'podtytuł testowy' ],
                          subcategories: [
                            {
                              name: 'Podpodtytuł',
                              values: [ 'podpodtytuł testowy' ]
                            }
                          ]
                        }
                      ]
                    },
                    { name: 'Artyści', values: [ 'testowi' ], subcategories: [] },
                    {
                      name: 'Rok',
                      values: [ '966' ],
                      subcategories: [
                        {
                          name: 'Miesiąc',
                          values: [ '12' ],
                          subcategories: [ { name: 'Dzień', values: [ '13' ] } ]
                        }
                      ]
                    }
                  ],
                  collectionName: 'collection'
                },
                {
                  _id: "6718078ad4821e244dd54b84",
                  createdAt: '2024-10-22T20:14:13.773Z',
                  updatedAt: '2024-10-22T20:14:13.773Z',
                  __v: 0,
                  categories: [
                    {
                      name: 'Tytuł',
                      values: [ 'testowy 2' ],
                      subcategories: [ { name: 'Znaczenie tytułu', values: [ 'testowe' ] } ]
                    },
                    {
                      name: 'Artyści',
                      values: [ 'artysta testowy' ],
                      subcategories: []
                    },
                    {
                      name: 'Rok',
                      values: [ '955' ],
                      subcategories: [
                        {
                          name: 'Kwartał',
                          values: [ 'III' ],
                          subcategories: [
                            {
                              name: 'Miesiąc',
                              values: [ 'Wrzesień' ],
                              subcategories: [ { name: 'Dzień', values: [ '1' ] } ]
                            }
                          ]
                        }
                      ]
                    }
                  ],
                  collectionName: 'collection'
                }
              ])}},
        },
        {
            testName: 'getAllColletions test - no artworks in collection',
            artworkFind: () => {return {exec: () => Promise.resolve([])}},
        },
    ])(`$testName`,
        async ({artworkFind}) => {
            mockCollectionFind.mockImplementation(() => {return {exec: () => Promise.resolve([
                {
                    _id: "6717d46c666e8575d873ee57",
                    name: 'collection',
                    description: 'collection description',
                    __v: 0
                }
            ])}})
            mockArtworkFind.mockImplementation(artworkFind)
    
            expect(await getAllCategories("collection")).toMatchSnapshot();
        }
    )

    test.each([
        {
            testName: 'getAllColletions test - throw error when collection not found',
            collectionFind: () => {return {exec: () => Promise.resolve([])}},
            artworkFind: () => {},
            error: "Collection not found"
        },
        {
            testName: 'getAllColletions test - Collection.find() throws error',
            collectionFind: () => {throw Error()},
            artworkFind: () => {},
            error: "Database unavailable"
        },
        {
            testName: 'getAllColletions test - Artwork.find() throws error',
            collectionFind: () => {return {exec: () => Promise.resolve([
                {
                    _id: "6717d46c666e8575d873ee57",
                    name: 'collection',
                    description: 'collection description',
                    __v: 0
                }
                ])}},
            artworkFind: () => {throw Error()},
            error: "Database unavailable"
        },
    ])(`$testName`,
        async ({collectionFind, artworkFind, error}) => {
            mockCollectionFind.mockImplementation(collectionFind)
            mockArtworkFind.mockImplementation(artworkFind)

            expect(() => getAllCategories("collection")).rejects.toThrow(error);
        }
    )
})