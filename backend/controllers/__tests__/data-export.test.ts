import {describe, expect, test, jest, beforeEach} from "@jest/globals"
import express from "express";
import bodyParser from "body-parser";
import request from "supertest";
import DataExportRouter from "../../routes/dataExport";
import { collectionId2, jwtToken } from "./utils/consts";

const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const mockVerifyToken = jest.fn() 
jest.mock('../../utils/auth', () => ({
    verifyToken: () => mockVerifyToken()
}))

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
const mockCollectionFind = jest.fn()
jest.mock("../../models/collection", () => ({
    findOne: () => mockCollectionFindOne(),
    find: (filter: any) => mockCollectionFind(filter)
}))

const collectionId = "66f2194a6123d7f50558cd8f"
const collectionName = "collection"
const collectionData = {
    _id: collectionId,
    name: collectionName,
    description: 'collection description',
    categories: [
        {name: 'Tytuł', subcategories: []}
    ],
    __v: 0,
    isPrivate: true,
    owner:"12345678d6303ed5ac5a4321"
}
const collectionFindReturnValue = ({exec: () => Promise.resolve([collectionData])})
const collectionFindOneReturnValue = ({exec: () => Promise.resolve((collectionData))})

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
                artworkFind: () => {},
                verifyToken: () => {}
            },
            {
                statusCode: 404, error: 'Collection not found',
                collectionFindOne: () => ({exec: () => Promise.resolve(null)}),
                getAllCategories: () => {},
                artworkFind: () => {},
                verifyToken: () => {}
            },
            {
                statusCode: 404, error: 'Collection not found',
                collectionFindOne: () => collectionFindOneReturnValue,
                getAllCategories: () => {throw new Error("Collection not found")},
                artworkFind: () => {},
                verifyToken: () => {}
            },
            {
                statusCode: 503, error: 'Database unavailable',
                collectionFindOne: () => collectionFindOneReturnValue,
                getAllCategories: () => {throw new Error("Database unavailable")},
                artworkFind: () => {},
                verifyToken: () => {}
            },
            {
                statusCode: 503, error: 'Database unavailable',
                collectionFindOne: () => collectionFindOneReturnValue,
                getAllCategories: () => [ 'Title' ],
                artworkFind: () => {throw new Error()},
                verifyToken: () => {}
            },
            {
                statusCode: 401, error: 'No token provided',
                collectionFindOne: () => collectionFindOneReturnValue,
                getAllCategories: () => [ 'Title' ],
                artworkFind: () => {},
                verifyToken: () => {throw Error("No token provided")}
            },
            {
                statusCode: 401, error: 'Access denied',
                collectionFindOne: () => collectionFindOneReturnValue,
                getAllCategories: () => [ 'Title' ],
                artworkFind: () => {},
                verifyToken: () => {throw Error("Access denied")}
            },
        ])(`getXlsxWithCollectionData should respond with status $statusCode and correct error message`,
                async ({ statusCode, error, collectionFindOne, getAllCategories, artworkFind, verifyToken}) => {
                    mockCollectionFindOne.mockImplementation(collectionFindOne)
                    mockGetAllCategories.mockImplementation(getAllCategories)
                    mockArtworkFind.mockImplementation(artworkFind)
                    mockFillRow.mockReturnValue({ 'Title': 'An artwork title' })
                    mockVerifyToken.mockImplementation(verifyToken)

                    const res = await request(app)
                    .get(`/collection/${collectionId}`)
                    .set('Accept', 'application/json')
                    .set('Authorization', `Bearer ${jwtToken}`)
    
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
                collectionIds: [collectionId],
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
                    ])}},
                    verifyToken: () => {},
                    collectionFilter: {_id: {$in: collectionId}}
            },
            {
                testName: "export selected artworks from collection",
                columnNamesQuery: '&columnNames=Title&columnNames=Year',
                selectedArtworksQuery: '&selectedArtworks=66faa0e88b8813759f44caf4&selectedArtworks=66fbb0e88b8813759f44cae3',
                exportExtentQuery: '&exportExtent=selected',
                collectionIds: [collectionId],
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
                    ])}},
                    verifyToken: () => {},
                    collectionFilter: {_id: {$in: collectionId}}
            },
            {
                testName: "export artworks quicksearch result from collection",
                columnNamesQuery: '&columnNames=Title&columnNames=Year',
                selectedArtworksQuery: undefined,
                exportExtentQuery: '&exportExtent=searchResult',
                collectionIds: [collectionId],
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
                    ])}},
                    verifyToken: () => {},
                    collectionFilter: {_id: {$in: collectionId}}
            },
            {
                testName: "export artworks advanced search result from collection",
                columnNamesQuery: '&columnNames=Title&columnNames=Year',
                selectedArtworksQuery: undefined,
                exportExtentQuery: '&exportExtent=searchResult',
                collectionIds: [collectionId],
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
                    ])}},
                    verifyToken: () => {},
                    collectionFilter: {_id: {$in: collectionId}}
            },
            {
                testName: "req.query.columnNames is of type string (not Array<string>)",
                columnNamesQuery: '&columnNames=Title',
                selectedArtworksQuery: '&selectedArtworks=66faa0e88b8813759f44caf4&selectedArtworks=66fbb0e88b8813759f44cae3',
                exportExtentQuery: '&exportExtent=selected',
                collectionIds: [collectionId],
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
                    ])}},
                    verifyToken: () => {},
                    collectionFilter: {_id: {$in: collectionId}}
            },
            {
                testName: "req.query.collectionIds is of type string (not Array<string>)",
                columnNamesQuery: '&columnNames=Title&columnNames=Year',
                selectedArtworksQuery: '&selectedArtworks=66faa0e88b8813759f44caf4&selectedArtworks=66fbb0e88b8813759f44cae3',
                exportExtentQuery: '&exportExtent=selected',
                collectionIds: collectionId,
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
                    ])}},
                    verifyToken: () => {},
                    collectionFilter: {_id: {$in: collectionId}}
            },
            {
                testName: "no token, export all artworks only from public collection",
                columnNamesQuery: '&columnNames=Title&columnNames=Year',
                selectedArtworksQuery: undefined,
                exportExtentQuery: '&exportExtent=all',
                collectionIds: [collectionId, collectionId2],
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
                    updatedAt: '2024-09-25T03:25:16.376Z',
                    isPrivate: false,
                    owner:"12345678d6303ed5ac5a4321" 
                },
                {
                    _id: "66f3829cfaa77054d286dbe8",
                    categories: [ { name: 'Title', value: 'An artwork title', subcategories: [] },
                        { name: 'Year', value: '1410', subcategories: [] } ],
                    collectionName: collectionName,
                    __v: 0,
                    createdAt: '2024-09-25T03:25:16.376Z',
                    updatedAt: '2024-09-25T03:25:16.376Z',
                    isPrivate: true,
                    owner:"12345678d6303ed5ac5a4321" 
                },
                ])}},
                verifyToken: () => {throw Error("Access denied")},
                collectionFilter: {_id: {$in: [collectionId, collectionId2]}, isPrivate: false}
            },
        ])(`getXlsxWithArtworksData should respond with status 200 and correct body - $testName`,
                async ({ columnNamesQuery, selectedArtworksQuery, exportExtentQuery, collectionIds, searchQuery, quickSearchCalls, advSearchCalls, find, verifyToken, collectionFilter}) => {
                    mockCollectionFind.mockReturnValue(collectionFindReturnValue)
                    mockArtworkFind.mockImplementation(find)
                    mockFillRow.mockImplementation(() => {})
                    mockVerifyToken.mockImplementation(verifyToken)
                    
                    let queryString = '/?'
                    if (columnNamesQuery) queryString += columnNamesQuery
                    if (selectedArtworksQuery) queryString += selectedArtworksQuery
                    if (exportExtentQuery) queryString += exportExtentQuery
                    if (searchQuery) queryString += searchQuery
                    if (collectionIds) {
                        if(typeof collectionIds !== "string")
                            for(const id of collectionIds) {
                                queryString += `&collectionIds=${id}`
                            }
                        else
                            queryString += `&collectionIds=${collectionIds}`
                    }
                    const res = await request(app)
                    .get(queryString)
                    .set('Accept', 'application/json')

                    expect(res.status).toBe(200)
                    expect(res.body).toMatchSnapshot()
                    expect(mockCollectionFind).toHaveBeenCalledWith(collectionFilter)
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
                collectionIds: [collectionId],
                collectionFind: () => collectionFindReturnValue,
                artworkFind: () => {}
            },
            {
                statusCode: 400, error: 'Request is missing query params',
                columnNamesQuery: '&columnNames=Title&columnNames=Year',
                selectedArtworksQuery: '&selectedArtworks=66faa0e88b8813759f44caf4&selectedArtworks=66fbb0e88b8813759f44cae3',
                exportExtentQuery: undefined,
                collectionIds: [collectionId],
                collectionFind: () => collectionFindReturnValue,
                artworkFind: () => {}
            },
            {
                statusCode: 400, error: 'Request is missing query params',
                columnNamesQuery: '&columnNames=Title&columnNames=Year',
                selectedArtworksQuery: undefined,
                exportExtentQuery: '&exportExtent=selected',
                collectionIds: [collectionId],
                collectionFind: () => collectionFindReturnValue,
                artworkFind: () => {}
            },
            {
                statusCode: 400, error: 'Request is missing query params',
                columnNamesQuery: '&columnNames=Title&columnNames=Year',
                selectedArtworksQuery: '&selectedArtworks=66faa0e88b8813759f44caf4&selectedArtworks=66fbb0e88b8813759f44cae3',
                exportExtentQuery: '&exportExtent=selected',
                collectionIds: undefined,
                collectionFind: () => collectionFindReturnValue,
                artworkFind: () => {}
            },
            {
                statusCode: 404, error: 'Collection not found',
                columnNamesQuery: '&columnNames=Title&columnNames=Year',
                selectedArtworksQuery: undefined,
                exportExtentQuery: '&exportExtent=all',
                collectionIds: [collectionId],
                collectionFind: () => ({exec: () => Promise.resolve([])}),
                artworkFind: () => {}
            },
            {
                statusCode: 503, error: 'Database unavailable',
                columnNamesQuery: '&columnNames=Title&columnNames=Year',
                selectedArtworksQuery: undefined,
                exportExtentQuery: '&exportExtent=all',
                collectionIds: [collectionId],
                collectionFind: () => {throw Error("")},
                artworkFind: () => {}
            },
            {
                statusCode: 503, error: 'Database unavailable',
                columnNamesQuery: '&columnNames=Title&columnNames=Year',
                selectedArtworksQuery: undefined,
                exportExtentQuery: '&exportExtent=all',
                collectionIds: [collectionId],
                collectionFind: () => collectionFindReturnValue,
                artworkFind: () => {throw Error("")}
            },
            {
                statusCode: 503, error: 'Database unavailable',
                columnNamesQuery: '&columnNames=Title&columnNames=Year',
                selectedArtworksQuery: '&selectedArtworks=66faa0e88b8813759f44caf4&selectedArtworks=66fbb0e88b8813759f44cae3',
                exportExtentQuery: '&exportExtent=selected',
                collectionIds: [collectionId],
                collectionFind: () => collectionFindReturnValue,
                artworkFind: () => {throw Error("")}
            },
            {
                statusCode: 503, error: 'Database unavailable',
                columnNamesQuery: '&columnNames=Title&columnNames=Year',
                selectedArtworksQuery: '&selectedArtworks=66faa0e88b8813759f44caf4&selectedArtworks=66fbb0e88b8813759f44cae3',
                exportExtentQuery: '&exportExtent=searchResult&searchText=Year',
                collectionIds: [collectionId],
                collectionFind: () => collectionFindReturnValue,
                artworkFind: () => {throw Error("")}
            },
        ])(`getXlsxWithArtworksData should respond with status $statusCode and correct error message`,
                async ({ statusCode, error, columnNamesQuery, selectedArtworksQuery, exportExtentQuery, collectionIds, collectionFind, artworkFind}) => {
                    mockCollectionFind.mockImplementation(collectionFind)
                    mockArtworkFind.mockImplementation(artworkFind)
                    mockFillRow.mockReturnValue({ 'Title': 'An artwork title' })
                    
                    let queryString = '/?'
                    if (columnNamesQuery) queryString += columnNamesQuery
                    if (selectedArtworksQuery) queryString += selectedArtworksQuery
                    if (exportExtentQuery) queryString += exportExtentQuery
                    if (collectionIds) {
                        for(const id of collectionIds) {
                            queryString += `&collectionIds=${id}`
                        }
                    }
                    const res = await request(app)
                    .get(queryString)
                    .set('Accept', 'application/json')

                    expect(res.status).toBe(statusCode)
                    expect(res.body.error).toBe(error)
                }
            )
    })
    
})