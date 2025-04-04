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

const mockFind = jest.fn()
jest.mock("../../models/artwork", () => ({
    find: () => mockFind()
}))

describe('data-export controller', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        app.use(DataExportRouter)
    })
    describe('GET endpoints', () => {
        test("getXlsxWithCollectionData should respond with status 200 and correct body", async () => {
            mockGetAllCategories.mockReturnValue([ 'Title' ])
            mockFind.mockReturnValue({exec: () => Promise.resolve([
                {
                    _id: "66f3829cfaa77054d286dbe8",
                    categories: [ { name: 'Title', value: 'An artwork title', subcategories: [] } ],
                    collectionName: 'collection',
                    __v: 0,
                    createdAt: '2024-09-25T03:25:16.376Z',
                    updatedAt: '2024-09-25T03:25:16.376Z'
                  }
              ])})
            mockFillRow.mockReturnValue({ 'Title': 'An artwork title' })

            const res = await request(app)
                .get(`/collection/collection`)
                .set('Accept', 'application/json')

            expect(res.status).toBe(200)
            expect(res.body).toMatchSnapshot()
        })

        test.each([
            {
                statusCode: 500, error: 'Error preparing data for xlsx file',
                getAllCategories: () => {throw new Error("Error preparing data for xlsx file")},
                find: () => {},
                fillRow: () => {}
            },
            {
                statusCode: 503, error: 'Database unavailable',
                getAllCategories: () => [ 'Title' ],
                find: () => {throw new Error()},
                fillRow: () => {}
            },
            {
                statusCode: 500, error: 'Error preparing data for xlsx file',
                getAllCategories: () => {throw new Error("Error preparing data for xlsx file")},
                find: () => {return {exec: () => Promise.resolve([
                    {
                        _id: "66f3829cfaa77054d286dbe8",
                        categories: [ { name: 'Title', value: 'An artwork title', subcategories: [] } ],
                        collectionName: 'collection',
                        __v: 0,
                        createdAt: '2024-09-25T03:25:16.376Z',
                        updatedAt: '2024-09-25T03:25:16.376Z'
                      }
                  ])}},
                fillRow: () => {throw new Error("Error preparing data for xlsx file")}
            },
        ])(`getXlsxWithCollectionData should respond with status $statusCode and correct error message`,
                async ({ statusCode, error, getAllCategories, find, fillRow}) => {
                    mockGetAllCategories.mockImplementation(getAllCategories)
                    mockFind.mockImplementation(find)
                    mockFillRow.mockImplementation(fillRow)

                    const res = await request(app)
                    .get(`/collection/collection`)
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
                            collectionName: 'collection',
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
                        mockFind.mockImplementation(find)
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
                find: () => {throw new Error("")},
                fillRow: () => {}
            },
            {
                statusCode: 400, error: 'Request is missing query params',
                columnNamesQuery: '&columnNames=Title&columnNames=Year',
                selectedArtworksQuery: '&selectedArtworks=66faa0e88b8813759f44caf4&selectedArtworks=66fbb0e88b8813759f44cae3',
                exportExtentQuery: undefined,
                find: () => {throw new Error("")},
                fillRow: () => {}
            },
            {
                statusCode: 400, error: 'Request is missing query params',
                columnNamesQuery: '&columnNames=Title&columnNames=Year',
                selectedArtworksQuery: undefined,
                exportExtentQuery: '&exportExtent=selected',
                find: () => {throw new Error("")},
                fillRow: () => {}
            },
            {
                statusCode: 503, error: 'Database unavailable',
                columnNamesQuery: '&columnNames=Title&columnNames=Year',
                selectedArtworksQuery: undefined,
                exportExtentQuery: '&exportExtent=all',
                find: () => {throw Error("")},
                fillRow: () => {}
            },
            {
                statusCode: 500, error: 'Error preparing data for xlsx file',
                columnNamesQuery: '&columnNames=Title&columnNames=Year',
                selectedArtworksQuery: undefined,
                exportExtentQuery: '&exportExtent=all',
                find: () => {return {exec: () => Promise.resolve([
                    {
                        _id: "66f3829cfaa77054d286dbe8",
                        categories: [ { name: 'Title', value: 'An artwork title', subcategories: [] },
                            { name: 'Year', value: '1410', subcategories: [] } ],
                        collectionName: 'collection',
                        __v: 0,
                        createdAt: '2024-09-25T03:25:16.376Z',
                        updatedAt: '2024-09-25T03:25:16.376Z'
                        }
                    ])}},
                fillRow: () => {throw new Error("Error preparing data for xlsx file")}
            },
            {
                statusCode: 503, error: 'Database unavailable',
                columnNamesQuery: '&columnNames=Title&columnNames=Year',
                selectedArtworksQuery: '&selectedArtworks=66faa0e88b8813759f44caf4&selectedArtworks=66fbb0e88b8813759f44cae3',
                exportExtentQuery: '&exportExtent=selected',
                find: () => {throw Error("")},
                fillRow: () => {}
            },
            {
                statusCode: 503, error: 'Database unavailable',
                columnNamesQuery: '&columnNames=Title&columnNames=Year',
                selectedArtworksQuery: '&selectedArtworks=66faa0e88b8813759f44caf4&selectedArtworks=66fbb0e88b8813759f44cae3',
                exportExtentQuery: '&exportExtent=searchResult&searchText=Year',
                find: () => {throw Error("")},
                fillRow: () => {}
            },
            {
                statusCode: 500, error: 'Error preparing data for xlsx file',
                columnNamesQuery: '&columnNames=Title&columnNames=Year',
                selectedArtworksQuery: '&selectedArtworks=66faa0e88b8813759f44caf4&selectedArtworks=66fbb0e88b8813759f44cae3',
                exportExtentQuery: '&exportExtent=selected',
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
                    ])}},
                fillRow: () => {throw new Error("Error preparing data for xlsx file")}
            },
        ])(`getXlsxWithArtworksData should respond with status $statusCode and correct error message`,
                async ({ statusCode, error, columnNamesQuery, selectedArtworksQuery, exportExtentQuery, find, fillRow}) => {
                    mockFind.mockImplementation(find)
                    mockFillRow.mockImplementation(fillRow)
                    
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