import { describe, expect, test, jest, beforeEach } from "@jest/globals"
import express from "express";
import request from "supertest";
import bodyParser from "body-parser";
import CollectionsRouter from "../../routes/collection";
import {jwtToken, collectionId, collectionName, collectionDescription, startSessionDefaultReturnValue,
    collectionFindByIdNotFound, collectionFindByIdHappyPath, collectionFindByIdSaveFailed,
    artworkFindSaveFailed, artworkFindHappyPath, artworkWithUpdatedcategories
} from "./utils/consts"

const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
const mockStartSession = jest.fn()
jest.mock('mongoose', () => ({
	startSession: () => mockStartSession()
}))

const mockCollectionFindOne = jest.fn()
const mockCollectionCreate = jest.fn()
const mockCollectionFind = jest.fn()
const mockCollectionDeleteMany = jest.fn()
const mockCollectionCountDocuments = jest.fn()
const mockCollectionFindById = jest.fn()
jest.mock("../../models/collection", () => ({
	findOne: () => mockCollectionFindOne(),
    create: () => mockCollectionCreate(),
    find: () => mockCollectionFind(),
    deleteMany: () => mockCollectionDeleteMany(),
    countDocuments: () => mockCollectionCountDocuments(),
    findById: () => mockCollectionFindById()
}))

const mockArtworkDeleteMany = jest.fn()
const mockArtworkAggregate = jest.fn()
const mockArtworkFind = jest.fn()
jest.mock("../../models/artwork", () => ({
    deleteMany: () => mockArtworkDeleteMany(),
    aggregate: () => mockArtworkAggregate(),
    find: () => mockArtworkFind()
}))

const mockHasValidCategoryFormat = jest.fn()
const mockIsValidCollectionCategoryStructureForCollectionUpdate = jest.fn()
const mockTrimCategoryNames = jest.fn()
jest.mock("../../utils/categories", () => ({
    hasValidCategoryFormat: () => mockHasValidCategoryFormat(),
    isValidCollectionCategoryStructureForCollectionUpdate: () => mockIsValidCollectionCategoryStructureForCollectionUpdate(),
    trimCategoryNames: () => mockTrimCategoryNames()
}))

const mockUpdateArtworkCategories = jest.fn()
jest.mock("../../utils/artworks", () => ({
    updateArtworkCategories: () => mockUpdateArtworkCategories()
}))

jest.mock("jsonwebtoken", () => ({
	verify: jest.fn()
}))

describe('collections controller', () =>{
    beforeEach(() => {
		jest.resetAllMocks()
	})
    
    describe('GET endpoints', () =>{

        test("getAllCollections should respond with status 200 and correct body", async () => {
            mockCollectionFind.mockReturnValue({collation: () => ({sort: () => ({skip: () => ({limit: () => ({exec: () => Promise.resolve([
                {
                    _id: "66f2194a6123d7f50558cd8f",
                    name: 'collection 1',
                    description: 'description 1',
                    __v: 0
                },
                {
                    _id: "66f2194a6214d7f50558cd7e",
                    name: 'collection 2',
                    description: 'description 2',
                    __v: 0
                },
                {
                    _id: "66f2194a6214d7f50558ac1b",
                    name: 'collection 3',
                    description: 'description 3',
                    __v: 0
                },
            ])})})})})})
            mockCollectionCountDocuments.mockReturnValue(Promise.resolve(3))
            mockArtworkAggregate.mockReturnValue({exec: () => Promise.resolve([
                { _id: 'collection 1', count: 33 },
                { _id: 'collection 2', count: 17 }
            ])})

            const res = await request(app.use(CollectionsRouter))
            .get('/?page=1&pageSize=3&sortOrder=asc');
    
            expect(res.status).toBe(200)
            expect(res.body).toMatchSnapshot()
        })

        test.each([
            {statusCode: 400, error: 'Request is missing query params',
                pageQuery: undefined, pageSizeQuery: "&pageSize=3", sortOrderQuery: "&sortOrder=asc",
                collectionFind: () => {}, collectionCountDocuments: () => {}, aggregate: () => {}
            },
            {statusCode: 400, error: 'Request is missing query params',
                pageQuery: "&page=1", pageSizeQuery: undefined, sortOrderQuery: "&sortOrder=asc",
                collectionFind: () => {}, collectionCountDocuments: () => {}, aggregate: () => {}
            },
            {statusCode: 400, error: 'Request is missing query params',
                pageQuery: "&page=1", pageSizeQuery: "&pageSize=3", sortOrderQuery: undefined,
                collectionFind: () => {}, collectionCountDocuments: () => {}, aggregate: () => {}
            },
            {statusCode: 503, error: 'Database unavailable',
                pageQuery: "&page=1", pageSizeQuery: "&pageSize=3", sortOrderQuery: "&sortOrder=asc",
                collectionFind: () => {throw Error()},
                collectionCountDocuments: () => {},
                aggregate: () => {}
            },
            {statusCode: 503, error: 'Database unavailable',
                pageQuery: "&page=1", pageSizeQuery: "&pageSize=3", sortOrderQuery: "&sortOrder=asc",
                collectionFind: () => ({collation: () => ({sort: () => ({skip: () => ({limit: () => ({exec: () => Promise.resolve([
                    {
                        _id: "66f2194a6123d7f50558cd8f",
                        name: 'collection 1',
                        description: 'description 1',
                        __v: 0
                    },
                    {
                        _id: "66f2194a6214d7f50558cd7e",
                        name: 'collection 2',
                        description: 'description 2',
                        __v: 0
                    },
                    {
                        _id: "66f2194a6214d7f50558ac1b",
                        name: 'collection 3',
                        description: 'description 3',
                        __v: 0
                    },
                ])})})})})}),
                collectionCountDocuments: () => {throw Error()},
                aggregate: () => {}
            },
            {statusCode: 503, error: 'Database unavailable',
                pageQuery: "&page=1", pageSizeQuery: "&pageSize=3", sortOrderQuery: "&sortOrder=asc",
                collectionFind: () => ({collation: () => ({sort: () => ({skip: () => ({limit: () => ({exec: () => Promise.resolve([
                    {
                        _id: "66f2194a6123d7f50558cd8f",
                        name: 'collection 1',
                        description: 'description 1',
                        __v: 0
                    },
                    {
                        _id: "66f2194a6214d7f50558cd7e",
                        name: 'collection 2',
                        description: 'description 2',
                        __v: 0
                    },
                    {
                        _id: "66f2194a6214d7f50558ac1b",
                        name: 'collection 3',
                        description: 'description 3',
                        __v: 0
                    },
                ])})})})})}),
                collectionCountDocuments: () => 3,
                aggregate: () => {throw Error()}
            },
        ])('getAllCollections should respond with status $statusCode and correct error message',
            async ({statusCode, error, pageQuery, pageSizeQuery, sortOrderQuery, collectionFind, collectionCountDocuments, aggregate}) => {
                mockCollectionFind.mockImplementation(collectionFind)
                mockCollectionCountDocuments.mockImplementation(collectionCountDocuments)
                mockArtworkAggregate.mockImplementation(aggregate)
                
                let queryString = '/?'
                if (pageQuery) queryString += pageQuery
                if (pageSizeQuery) queryString += pageSizeQuery
                if (sortOrderQuery) queryString += sortOrderQuery

                const res = await request(app.use(CollectionsRouter))
                .get(queryString);
        
                expect(res.status).toBe(statusCode)
                expect(res.body.error).toBe(error)
            }
        )
        
        test("getCollection should respond with status 200 and correct body", async () => {
            mockCollectionFindOne.mockReturnValue({
                exec: () => Promise.resolve({
                    _id: collectionId,
                    name: collectionName,
                    description: collectionDescription,
                    __v: 0
                })
            })

            const res = await request(app.use(CollectionsRouter))
            .get(`/${collectionId}`);
    
            expect(res.status).toBe(200)
            expect(res.body).toMatchSnapshot()
        })

        test.each([
            {statusCode: 503, error: 'Database unavailable', findOne: { exec: () => {throw Error()} }},
            {statusCode: 404, error: 'Collection not found', findOne: { exec: () => Promise.resolve(null) }}
        ])('getCollection should respond with status $statusCode and correct error message', async ({statusCode, error, findOne}) => {
            mockCollectionFindOne.mockReturnValue(findOne)

            const res = await request(app.use(CollectionsRouter))
            .get(`/${collectionId}`);
    
            expect(res.status).toBe(statusCode)
            expect(res.body.error).toBe(error)
        })
    })
 
    describe('POST endpoints', () =>{
        const correctCategories = [
            {name: "Tytuł", subcategories: [{name: "Podtytuł", subcategories: []}]},
            {name: "Artyści", subcategories: []}
        ]
        const collectionPromise = Promise.resolve({
            _id: collectionId,
            name: collectionName,
            description: collectionDescription,
            categories: correctCategories,
            __v: 0
        })
        test("createCollection should respond with status 201 and correct body", async () => {
            mockHasValidCategoryFormat.mockReturnValue(true)
            mockStartSession.mockImplementation(() => startSessionDefaultReturnValue)
            mockCollectionFindOne.mockReturnValue({ exec: () => Promise.resolve(null) })
            mockCollectionCreate.mockReturnValue(collectionPromise)
            mockTrimCategoryNames.mockReturnValue(correctCategories)
            
            const payload = {
                name: collectionName,
                description: collectionDescription,
                categories: correctCategories
            }

            const res = await request(app.use(CollectionsRouter))
            .post('/create')
            .send(payload)
            .set('Authorization', `Bearer ${jwtToken}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')

            expect(res.status).toBe(201)
            expect(res.body).toMatchSnapshot()
        })

        test.each([
            {payload: {}, statusCode: 400,
                error: 'Incorrect request body provided', findOne: undefined, startSession: () => startSessionDefaultReturnValue,
                hasValidCategoryFormat: true
            }, 
            {payload: { name: collectionName }, statusCode: 400,
                error: 'Incorrect request body provided', findOne: undefined, startSession: () => startSessionDefaultReturnValue,
                hasValidCategoryFormat: true
            },
            {payload: { description: collectionDescription }, statusCode: 400,
                error: 'Incorrect request body provided', findOne: undefined, startSession: () => startSessionDefaultReturnValue,
                hasValidCategoryFormat: true
            },
            {payload: { name: collectionName, description: collectionDescription }, statusCode: 400,
                error: 'Incorrect request body provided', findOne: undefined, startSession: () => startSessionDefaultReturnValue,
                hasValidCategoryFormat: true
            },
            {payload: { name: collectionName, categories: correctCategories }, statusCode: 400,
                error: 'Incorrect request body provided', findOne: undefined, startSession: () => startSessionDefaultReturnValue,
                hasValidCategoryFormat: true
            },
            {payload: { description: collectionDescription, categories: correctCategories }, statusCode: 400,
                error: 'Incorrect request body provided', findOne: undefined, startSession: () => startSessionDefaultReturnValue,
                hasValidCategoryFormat: true
            },
            {payload: { name: collectionName, description: collectionDescription, categories: [{name: "Tytuł"}] }, statusCode: 400,
                error: 'Incorrect request body provided', findOne: undefined, startSession: () => startSessionDefaultReturnValue,
                hasValidCategoryFormat: false
            },   
            {payload: { name: collectionName, description: collectionDescription, categories: correctCategories }, statusCode: 503,
                error: "Database unavailable", findOne: undefined, startSession: () => {throw Error()},
                hasValidCategoryFormat: true
            },
            {payload: { name: collectionName, description: collectionDescription, categories: correctCategories}, statusCode: 503,
                error: 'Database unavailable', findOne: { exec: () => {throw Error()} }, startSession: () => startSessionDefaultReturnValue,
                hasValidCategoryFormat: true
            },
            {payload: { name: collectionName, description: collectionDescription, categories: correctCategories }, statusCode: 409,
                error: 'Collection with provided name already exists', findOne: { exec: () => collectionPromise }, startSession: () => startSessionDefaultReturnValue,
                hasValidCategoryFormat: true
            },
            {payload: { name: collectionName, description: collectionDescription, categories: correctCategories }, statusCode: 503,
                error: 'Database unavailable', findOne: { exec: () => Promise.resolve(null) }, startSession: () => startSessionDefaultReturnValue,
                hasValidCategoryFormat: true
            }
        ])('createCollection should respond with status $statusCode and correct error message', async ({payload, statusCode, error, findOne, startSession, hasValidCategoryFormat}) => {
            mockHasValidCategoryFormat.mockReturnValue(hasValidCategoryFormat)
            mockStartSession.mockImplementation(startSession)
            mockCollectionFindOne.mockReturnValue(findOne)
            mockCollectionCreate.mockImplementation(() => {throw Error()})
            mockTrimCategoryNames.mockReturnValue(payload.categories)

            const res = await request(app.use(CollectionsRouter))
            .post('/create')
            .send(payload)
            .set('Authorization', `Bearer ${jwtToken}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
    
            expect(res.status).toBe(statusCode)
            expect(res.body.error).toBe(error)
        })
    })

    describe('DELETE endpoints', () =>{
        const collectionFindDefault = {
        exec: () => Promise.resolve([
                {
                  _id: "66e9c0d8acd80b0970c81b4b",
                  name: '123',
                  description: '',
                  __v: 0
                },
                {
                  _id: "66e9c0ddacd80b0970c81b56",
                  name: '456',
                  description: '',
                  __v: 0
                }
            ])
        }
        const collectionFindIncomplete = {
            exec: () => Promise.resolve([
                {
                  _id: "66e9c0d8acd80b0970c81b4b",
                  name: '123',
                  description: '',
                  __v: 0
                }
            ])
        }

        test("deleteCollections should respond with status 200 and correct body", async () => {
            mockStartSession.mockImplementation(() => startSessionDefaultReturnValue)
            mockCollectionFind.mockReturnValue(collectionFindDefault)
            mockArtworkDeleteMany.mockReturnValueOnce({ exec: () => Promise.resolve({ acknowledged: true, deletedCount: 6 })})
            mockArtworkDeleteMany.mockReturnValueOnce({ exec: () => Promise.resolve({ acknowledged: true, deletedCount: 3 })})
            mockCollectionDeleteMany.mockReturnValue({ exec: () => Promise.resolve({ acknowledged: true, deletedCount: 2 })})
            const payload = { ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] }
            const res = await request(app.use(CollectionsRouter))
            .delete('/delete')
            .send(payload)
            .set('Authorization', `Bearer ${jwtToken}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')

            expect(res.status).toBe(200)
            expect(res.body).toMatchSnapshot()
        })

        test.each([
            {
                statusCode: 400, error: 'Incorrect request body provided', 
                payload: {},
                startSession: () => startSessionDefaultReturnValue,
                collectionFind: collectionFindDefault,
                artworkDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 6 })},
                collectionDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 2 })}
            },
            {   
                statusCode: 400, error: "Collections not specified",
                payload: { ids: [] },
                startSession: () => startSessionDefaultReturnValue,
                collectionFind: collectionFindDefault,
                artworkDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 6 })},
                collectionDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 2 })}
            },
            {
                statusCode: 503, error: "Database unavailable",
                payload: { ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] },
                startSession: () => {throw Error()}, collectionFind: collectionFindDefault,
                artworkDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 6 })},
                collectionDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 2 })}
            },
            {   
                payload: { ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] },
                statusCode: 404, error: "Collections not found",
                startSession: () => startSessionDefaultReturnValue, collectionFind: collectionFindIncomplete,
                artworkDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 6 })},
                collectionDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 2 })}},
            {payload: { ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] }, statusCode: 503,
                error: `Database unavailable`,
                startSession: () => startSessionDefaultReturnValue, collectionFind: () => {throw Error()},
                artworkDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 6 })},
                collectionDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 2 })}},
            {payload: { ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] }, statusCode: 503,
                error: `Database unavailable`,
                startSession: () => startSessionDefaultReturnValue, collectionFind: collectionFindDefault,
                artworkDeleteMany: {exec: () => {throw Error()}},
                collectionDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 2 })}},
            {payload: { ids: [ '662e92a5d628570afa5357bc', '662e928b11674920c8cc0abc' ] }, statusCode: 503,
                error: `Database unavailable`,
                startSession: () => startSessionDefaultReturnValue, collectionFind: collectionFindDefault,
                artworkDeleteMany: { exec: () => Promise.resolve({ acknowledged: true, deletedCount: 6 })},
                collectionDeleteMany: { exec: () => {throw Error()}}},
        ])('deleteCollections should respond with status $statusCode and correct error message', async ({statusCode, error, payload, startSession, collectionFind, artworkDeleteMany, collectionDeleteMany}) => {
            mockStartSession.mockImplementation(startSession)
            mockCollectionFind.mockReturnValue(collectionFind)
            mockArtworkDeleteMany.mockReturnValue(artworkDeleteMany)
            mockCollectionDeleteMany.mockReturnValue(collectionDeleteMany)

            const res = await request(app.use(CollectionsRouter))
            .delete('/delete')
            .send(payload)
            .set('Authorization', `Bearer ${jwtToken}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
    
            expect(res.status).toBe(statusCode)
            expect(res.body.error).toBe(error)
        })
    })

    describe('PUT endpoints', () =>{
        test("updateCollection should respond with status 200 and correct body", async () => {
            mockHasValidCategoryFormat.mockReturnValue(true)
            mockStartSession.mockImplementation(() => startSessionDefaultReturnValue)
            mockCollectionFindById.mockImplementation(collectionFindByIdHappyPath)
            mockArtworkFind.mockImplementation(artworkFindHappyPath)
            mockIsValidCollectionCategoryStructureForCollectionUpdate.mockReturnValue(true)
            mockUpdateArtworkCategories.mockReturnValue(artworkWithUpdatedcategories)
            const payload = { name: "nowa nazwa kolekcji", description: "nowy opis kolekcji", categories: [
                { name: 'Tytuł', subcategories: []}, 
                { name: 'Wykonawca', subcategories: []},]
            }
            mockTrimCategoryNames.mockReturnValue(payload.categories)

            const res = await request(app.use(CollectionsRouter))
            .put(`/edit/${collectionId}`)
            .send(payload)
            .set('Authorization', `Bearer ${jwtToken}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')

            expect(res.status).toBe(200)
            expect(res.body).toMatchSnapshot()
        })

        test.each([
            {
                payload: {description: "nowy opis", categories: [
                    { name: 'Tytuł', subcategories: []}, 
                    { name: 'Wykonawca', subcategories: []},]},
                statusCode: 400,
                error: "Incorrect request body provided",
                startSession: () => startSessionDefaultReturnValue,
                hasValidCategoryFormat: true,
                collectionFindById: collectionFindByIdHappyPath,
                artworkFind: artworkFindHappyPath,
                isValidCollectionCategoryStructureForCollectionUpdate: true
            },
            {
                payload: {name: "nowa", categories: [
                    { name: 'Tytuł', subcategories: []}, 
                    { name: 'Wykonawca', subcategories: []},]},
                statusCode: 400,
                error: "Incorrect request body provided",
                startSession: () => startSessionDefaultReturnValue,
                hasValidCategoryFormat: true,
                collectionFindById: collectionFindByIdHappyPath,
                artworkFind: artworkFindHappyPath,
                isValidCollectionCategoryStructureForCollectionUpdate: true
            },
            {
                payload: {name: "nowa", description: "nowy opis" },
                statusCode: 400,
                error: "Incorrect request body provided",
                startSession: () => startSessionDefaultReturnValue,
                hasValidCategoryFormat: true,
                collectionFindById: collectionFindByIdHappyPath,
                artworkFind: artworkFindHappyPath,
                isValidCollectionCategoryStructureForCollectionUpdate: true
            },
            {
                payload: {name: "nowa", description: "nowy opis", categories: [
                    { name: 'Tytuł', subcategories: []}, 
                    { name: 'Wykonawca', subcategories: []},]},
                statusCode: 400,
                error: "Incorrect request body provided",
                startSession: () => startSessionDefaultReturnValue,
                hasValidCategoryFormat: false,
                collectionFindById: collectionFindByIdHappyPath,
                artworkFind: artworkFindHappyPath,
                isValidCollectionCategoryStructureForCollectionUpdate: true
            },
            {
                payload: {name: "nowa", description: "nowy opis", categories: [
                    { name: 'Tytuł', subcategories: []}, 
                    { name: 'Wykonawca', subcategories: []},]},
                statusCode: 400,
                error: "Incorrect request body provided",
                startSession: () => startSessionDefaultReturnValue,
                hasValidCategoryFormat: true,
                collectionFindById: collectionFindByIdHappyPath,
                artworkFind: artworkFindHappyPath,
                isValidCollectionCategoryStructureForCollectionUpdate: false
            },
            {
                payload: {name: "nowa", description: "nowy opis", categories: [
                    { name: 'Tytuł', subcategories: []}, 
                    { name: 'Wykonawca', subcategories: []},]},
                statusCode: 503,
                error: "Database unavailable",
                startSession: () => {throw Error()},
                hasValidCategoryFormat: true,
                collectionFindById: collectionFindByIdHappyPath,
                artworkFind: artworkFindHappyPath,
                isValidCollectionCategoryStructureForCollectionUpdate: true
            },
            {
                payload: {name: "nowa", description: "nowy opis", categories: [
                    { name: 'Tytuł', subcategories: []}, 
                    { name: 'Wykonawca', subcategories: []},]},
                statusCode: 503,
                error: "Database unavailable",
                startSession: () => startSessionDefaultReturnValue,
                hasValidCategoryFormat: true,
                collectionFindById: () => {throw Error()},
                artworkFind: artworkFindHappyPath,
                isValidCollectionCategoryStructureForCollectionUpdate: true
            },
            {
                payload: {name: "nowa", description: "nowy opis", categories: [
                    { name: 'Tytuł', subcategories: []}, 
                    { name: 'Wykonawca', subcategories: []},]},
                statusCode: 503,
                error: "Database unavailable",
                startSession: () => startSessionDefaultReturnValue,
                hasValidCategoryFormat: true,
                collectionFindById: collectionFindByIdHappyPath,
                artworkFind: () => {throw Error()},
                isValidCollectionCategoryStructureForCollectionUpdate: true
            },
            {
                payload: {name: "nowa", description: "nowy opis", categories: [
                    { name: 'Tytuł', subcategories: []}, 
                    { name: 'Wykonawca', subcategories: []},]},
                statusCode: 503,
                error: "Database unavailable",
                startSession: () => startSessionDefaultReturnValue,
                hasValidCategoryFormat: true,
                collectionFindById: collectionFindByIdHappyPath,
                artworkFind: artworkFindSaveFailed,
                isValidCollectionCategoryStructureForCollectionUpdate: true
            },
            {
                payload: {name: "nowa", description: "nowy opis", categories: [
                    { name: 'Tytuł', subcategories: []}, 
                    { name: 'Wykonawca', subcategories: []},]},
                statusCode: 503,
                error: "Database unavailable",
                startSession: () => startSessionDefaultReturnValue,
                hasValidCategoryFormat: true,
                collectionFindById: collectionFindByIdSaveFailed,
                artworkFind: artworkFindHappyPath,
                isValidCollectionCategoryStructureForCollectionUpdate: true
            },
            {
                payload: {name: "nowa", description: "nowy opis", categories: [
                    { name: 'Tytuł', subcategories: []}, 
                    { name: 'Wykonawca', subcategories: []},]},
                statusCode: 404,
                error: "Collection not found",
                startSession: () => startSessionDefaultReturnValue,
                hasValidCategoryFormat: true,
                collectionFindById: collectionFindByIdNotFound,
                artworkFind: artworkFindHappyPath,
                isValidCollectionCategoryStructureForCollectionUpdate: true
            },
        ])('deleteCollections should respond with status $statusCode and correct error message', async ({payload, statusCode, error, startSession, hasValidCategoryFormat, collectionFindById, artworkFind, isValidCollectionCategoryStructureForCollectionUpdate}) => {
            mockHasValidCategoryFormat.mockReturnValue(hasValidCategoryFormat)
            mockStartSession.mockImplementation(startSession)
            mockCollectionFindById.mockImplementation(collectionFindById)
            mockArtworkFind.mockImplementation(artworkFind)
            mockIsValidCollectionCategoryStructureForCollectionUpdate.mockReturnValue(isValidCollectionCategoryStructureForCollectionUpdate)
            mockUpdateArtworkCategories.mockReturnValue(artworkWithUpdatedcategories)

            const res = await request(app.use(CollectionsRouter))
            .put(`/edit/${collectionId}`)
            .send(payload)
            .set('Authorization', `Bearer ${jwtToken}`)
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
    
            expect(res.status).toBe(statusCode)
            expect(res.body.error).toBe(error)
        })
    })
})