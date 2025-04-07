import {describe, expect, test, jest, beforeEach} from "@jest/globals"
import express from "express";
import bodyParser from "body-parser";
import request from "supertest";
import DataExportRouter from "../../routes/dataExport";

const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const mockGetAllCategories = jest.fn()
jest.mock("../../utils/categories", () => ({
    getAllCategories: () => mockGetAllCategories(),
}))

const mockConstructAdvSearchFilter = jest.fn()
const mockConstructQuickSearchFilter = jest.fn()
jest.mock("../../utils/artworks", () => ({
    constructAdvSearchFilter: () => mockConstructAdvSearchFilter(),
    constructQuickSearchFilter: () => mockConstructQuickSearchFilter()
}))

const mockFillRow = jest.fn()
jest.mock("../../utils/data-export", () => ({
    fillRow: () => mockFillRow()
}))

const mockArtworkFind = jest.fn()
jest.mock("../../models/artwork", () => ({
    find: () => mockArtworkFind()
}))

const mockCollectionFindOne = jest.fn()
jest.mock("../../models/collection", () => ({
    findOne: () => mockCollectionFindOne()
}))

const collectionId = "66f2194a6123d7f50558cd8f"
const collectionName = "collection"
const collectionFindOneReturnValue = ({exec: () => Promise.resolve(({
    _id: collectionId,
    name: collectionName,
    description: 'collection description',
    categories: [
        {name: 'Tytuł', subcategories: []}
    ],
    __v: 0
}))})

describe('data-export controller', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        app.use(DataExportRouter)
    })
    describe('GET endpoints', () => {
        test("getXlsxWithCollectionData should respond with status 200 and correct body", async () => {
            mockCollectionFindOne.mockReturnValue(collectionFindOneReturnValue)
            mockGetAllCategories.mockReturnValue([ 'Title' ])
            mockArtworkFind.mockReturnValue({exec: () => Promise.resolve([
                {
                    _id: "66f3829cfaa77054d286dbe8",
                    categories: [ { name: 'Title', value: 'An artwork title', subcategories: [] } ],
                    collectionName: collectionName,
                    __v: 0,
                    createdAt: '2024-09-25T03:25:16.376Z',
                    updatedAt: '2024-09-25T03:25:16.376Z'
                  }
              ])})
            mockFillRow.mockReturnValue({ 'Title': 'An artwork title' })

            const res = await request(app)
                .get(`/collection/${collectionId}`)
                .set('Accept', 'application/json')

            expect(res.status).toBe(200)
            expect(res.body).toMatchSnapshot()
        })

        test.each([
            {
                statusCode: 503, error: 'Database unavailable',
                collectionFindOne: () => {throw Error()},
                getAllCategories: () => {},
                artworkFind: () => {}
            },
            {
                statusCode: 404, error: 'Collection not found',
                collectionFindOne: () => ({exec: () => Promise.resolve(null)}),
                getAllCategories: () => {},
                artworkFind: () => {}
            },
            {
                statusCode: 404, error: 'Collection not found',
                collectionFindOne: () => collectionFindOneReturnValue,
                getAllCategories: () => {throw new Error("Collection not found")},
                artworkFind: () => {}
            },
            {
                statusCode: 503, error: 'Database unavailable',
                collectionFindOne: () => collectionFindOneReturnValue,
                getAllCategories: () => {throw new Error("Database unavailable")},
                artworkFind: () => {}
            },
            {
                statusCode: 503, error: 'Database unavailable',
                collectionFindOne: () => collectionFindOneReturnValue,
                getAllCategories: () => [ 'Title' ],
                artworkFind: () => {throw new Error()}
            },
        ])(`getXlsxWithCollectionData should respond with status $statusCode and correct error message`,
                async ({ statusCode, error, collectionFindOne, getAllCategories, artworkFind}) => {
                    mockCollectionFindOne.mockImplementation(collectionFindOne)
                    mockGetAllCategories.mockImplementation(getAllCategories)
                    mockArtworkFind.mockImplementation(artworkFind)
                    mockFillRow.mockReturnValue({ 'Title': 'An artwork title' })

                    const res = await request(app)
                    .get(`/collection/${collectionId}`)
                    .set('Accept', 'application/json')
    
                    expect(res.status).toBe(statusCode)
                    expect(res.body.error).toBe(error)
                }
            )

        test.each([
            {
                testName: "export all artworks from collection",
                columnNamesQuery: '&columnNames=Title&columnNames=Year',
                selectedArtworksQuery: undefined,
                exportExtentQuery: '&exportExtent=all',
                searchQuery: undefined,
                quickSearchCalls: 0, advSearchCalls: 0,
                find: () => {return {exec: () => Promise.resolve([
                    {
                        _id: "66f3829cfaa77054d286dbe8",
                        categories: [ { name: 'Title', value: 'An artwork title', subcategories: [] },
                            { name: 'Year', value: '1410', subcategories: [] } ],
                        collectionName: collectionName,
                        __v: 0,
                        createdAt: '2024-09-25T03:25:16.376Z',
                        updatedAt: '2024-09-25T03:25:16.376Z'
                        }
                    ])}}
            },
            {
                testName: "export selected artworks from collection",
                columnNamesQuery: '&columnNames=Title&columnNames=Year',
                selectedArtworksQuery: '&selectedArtworks=66faa0e88b8813759f44caf4&selectedArtworks=66fbb0e88b8813759f44cae3',
                exportExtentQuery: '&exportExtent=selected',
                searchQuery: undefined,
                quickSearchCalls: 0, advSearchCalls: 0,
                find: () => {return {exec: () => Promise.resolve([
                    {
                        _id: "66faa0e88b8813759f44caf4",
                        categories: [ { name: 'Title', value: 'An artwork title', subcategories: [] },
                            { name: 'Year', value: '1410', subcategories: [] } ],
                        collectionName: 'collection',
                        __v: 0,
                        createdAt: '2024-09-25T03:25:16.376Z',
                        updatedAt: '2024-09-25T03:25:16.376Z'
                    },
                    {
                        _id: "66fbb0e88b8813759f44cae3",
                        categories: [ { name: 'Title2', value: 'An artwork title2', subcategories: [] },
                            { name: 'Year', value: '1410', subcategories: [] } ],
                        collectionName: 'collection',
                        __v: 0,
                        createdAt: '2024-09-25T03:25:16.376Z',
                        updatedAt: '2024-09-25T03:25:16.376Z'
                    },
                    ])}}
            },
            {
                testName: "export artworks quicksearch result from collection",
                columnNamesQuery: '&columnNames=Title&columnNames=Year',
                selectedArtworksQuery: undefined,
                exportExtentQuery: '&exportExtent=searchResult',
                searchQuery: '&searchText=1410',
                quickSearchCalls: 1, advSearchCalls: 0,
                find: () => {return {exec: () => Promise.resolve([
                    {
                        _id: "66faa0e88b8813759f44caf4",
                        categories: [ { name: 'Title', value: 'An artwork title', subcategories: [] },
                            { name: 'Year', value: '1410', subcategories: [] } ],
                        collectionName: 'collection',
                        __v: 0,
                        createdAt: '2024-09-25T03:25:16.376Z',
                        updatedAt: '2024-09-25T03:25:16.376Z'
                    },
                    {
                        _id: "66fbb0e88b8813759f44cae3",
                        categories: [ { name: 'Title2', value: 'An artwork title2', subcategories: [] },
                            { name: 'Year', value: '1410', subcategories: [] } ],
                        collectionName: 'collection',
                        __v: 0,
                        createdAt: '2024-09-25T03:25:16.376Z',
                        updatedAt: '2024-09-25T03:25:16.376Z'
                    },
                    ])}}
            },
            {
                testName: "export artworks advanced search result from collection",
                columnNamesQuery: '&columnNames=Title&columnNames=Year',
                selectedArtworksQuery: undefined,
                exportExtentQuery: '&exportExtent=searchResult',
                searchQuery: '&Year=1410',
                quickSearchCalls: 0, advSearchCalls: 1,
                find: () => {return {exec: () => Promise.resolve([
                    {
                        _id: "66faa0e88b8813759f44caf4",
                        categories: [ { name: 'Title', value: 'An artwork title', subcategories: [] },
                            { name: 'Year', value: '1410', subcategories: [] } ],
                        collectionName: 'collection',
                        __v: 0,
                        createdAt: '2024-09-25T03:25:16.376Z',
                        updatedAt: '2024-09-25T03:25:16.376Z'
                    },
                    {
                        _id: "66fbb0e88b8813759f44cae3",
                        categories: [ { name: 'Title2', value: 'An artwork title2', subcategories: [] },
                            { name: 'Year', value: '1410', subcategories: [] } ],
                        collectionName: 'collection',
                        __v: 0,
                        createdAt: '2024-09-25T03:25:16.376Z',
                        updatedAt: '2024-09-25T03:25:16.376Z'
                    },
                    ])}}
            },
            {
                testName: "req.query.columnNames is of type string (not Array<string>)",
                columnNamesQuery: '&columnNames=Title',
                selectedArtworksQuery: '&selectedArtworks=66faa0e88b8813759f44caf4&selectedArtworks=66fbb0e88b8813759f44cae3',
                exportExtentQuery: '&exportExtent=selected',
                searchQuery: undefined,
                quickSearchCalls: 0, advSearchCalls: 0,
                find: () => {return {exec: () => Promise.resolve([
                    {
                        _id: "66faa0e88b8813759f44caf4",
                        categories: [ { name: 'Title', value: 'An artwork title', subcategories: [] },
                            ],
                        collectionName: 'collection',
                        __v: 0,
                        createdAt: '2024-09-25T03:25:16.376Z',
                        updatedAt: '2024-09-25T03:25:16.376Z'
                    },
                    {
                        _id: "66fbb0e88b8813759f44cae3",
                        categories: [ { name: 'Title2', value: 'An artwork title2', subcategories: [] },
                            ],
                        collectionName: 'collection',
                        __v: 0,
                        createdAt: '2024-09-25T03:25:16.376Z',
                        updatedAt: '2024-09-25T03:25:16.376Z'
                    },
                    ])}}
            },
        ])(`getXlsxWithArtworksData should respond with status 200 and correct body - $testName`,
                async ({ columnNamesQuery, selectedArtworksQuery, exportExtentQuery, searchQuery, quickSearchCalls, advSearchCalls, find}) => {
                    mockCollectionFindOne.mockReturnValue(collectionFindOneReturnValue)
                    mockArtworkFind.mockImplementation(find)
                    mockFillRow.mockImplementation(() => {})
                    
                    let queryString = '/collection?'
                    if (columnNamesQuery) queryString += columnNamesQuery
                    if (selectedArtworksQuery) queryString += selectedArtworksQuery
                    if (exportExtentQuery) queryString += exportExtentQuery
                    if (searchQuery) queryString += searchQuery
                    const res = await request(app)
                    .get(queryString)
                    .set('Accept', 'application/json')

                    expect(res.status).toBe(200)
                    expect(res.body).toMatchSnapshot()
                    expect(mockConstructQuickSearchFilter).toHaveBeenCalledTimes(quickSearchCalls)
                    expect(mockConstructAdvSearchFilter).toHaveBeenCalledTimes(advSearchCalls)
                }
            )


        
        test.each([
            {
                statusCode: 400, error: 'Request is missing query params',
                columnNamesQuery: undefined,
                selectedArtworksQuery: '&selectedArtworks=66faa0e88b8813759f44caf4&selectedArtworks=66fbb0e88b8813759f44cae3',
                exportExtentQuery: '&exportExtent=selected',
                collectionFindOne: () => collectionFindOneReturnValue,
                artworkFind: () => {}
            },
            {
                statusCode: 400, error: 'Request is missing query params',
                columnNamesQuery: '&columnNames=Title&columnNames=Year',
                selectedArtworksQuery: '&selectedArtworks=66faa0e88b8813759f44caf4&selectedArtworks=66fbb0e88b8813759f44cae3',
                exportExtentQuery: undefined,
                collectionFindOne: () => collectionFindOneReturnValue,
                artworkFind: () => {}
            },
            {
                statusCode: 400, error: 'Request is missing query params',
                columnNamesQuery: '&columnNames=Title&columnNames=Year',
                selectedArtworksQuery: undefined,
                exportExtentQuery: '&exportExtent=selected',
                collectionFindOne: () => collectionFindOneReturnValue,
                artworkFind: () => {}
            },
            {
                statusCode: 404, error: 'Collection not found',
                columnNamesQuery: '&columnNames=Title&columnNames=Year',
                selectedArtworksQuery: undefined,
                exportExtentQuery: '&exportExtent=all',
                collectionFindOne: () => ({exec: () => Promise.resolve(null)}),
                artworkFind: () => {}
            },
            {
                statusCode: 503, error: 'Database unavailable',
                columnNamesQuery: '&columnNames=Title&columnNames=Year',
                selectedArtworksQuery: undefined,
                exportExtentQuery: '&exportExtent=all',
                collectionFindOne: () => {throw Error("")},
                artworkFind: () => {}
            },
            {
                statusCode: 503, error: 'Database unavailable',
                columnNamesQuery: '&columnNames=Title&columnNames=Year',
                selectedArtworksQuery: undefined,
                exportExtentQuery: '&exportExtent=all',
                collectionFindOne: () => collectionFindOneReturnValue,
                artworkFind: () => {throw Error("")}
            },
            {
                statusCode: 503, error: 'Database unavailable',
                columnNamesQuery: '&columnNames=Title&columnNames=Year',
                selectedArtworksQuery: '&selectedArtworks=66faa0e88b8813759f44caf4&selectedArtworks=66fbb0e88b8813759f44cae3',
                exportExtentQuery: '&exportExtent=selected',
                collectionFindOne: () => collectionFindOneReturnValue,
                artworkFind: () => {throw Error("")}
            },
            {
                statusCode: 503, error: 'Database unavailable',
                columnNamesQuery: '&columnNames=Title&columnNames=Year',
                selectedArtworksQuery: '&selectedArtworks=66faa0e88b8813759f44caf4&selectedArtworks=66fbb0e88b8813759f44cae3',
                exportExtentQuery: '&exportExtent=searchResult&searchText=Year',
                collectionFindOne: () => collectionFindOneReturnValue,
                artworkFind: () => {throw Error("")}
            },
        ])(`getXlsxWithArtworksData should respond with status $statusCode and correct error message`,
                async ({ statusCode, error, columnNamesQuery, selectedArtworksQuery, exportExtentQuery, collectionFindOne, artworkFind}) => {
                    mockCollectionFindOne.mockImplementation(collectionFindOne)
                    mockArtworkFind.mockImplementation(artworkFind)
                    mockFillRow.mockReturnValue({ 'Title': 'An artwork title' })
                    
                    let queryString = '/collection?'
                    if (columnNamesQuery) queryString += columnNamesQuery
                    if (selectedArtworksQuery) queryString += selectedArtworksQuery
                    if (exportExtentQuery) queryString += exportExtentQuery
                    const res = await request(app)
                    .get(queryString)
                    .set('Accept', 'application/json')

                    expect(res.status).toBe(statusCode)
                    expect(res.body.error).toBe(error)
                }
            )
    })
    
})