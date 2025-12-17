import '@testing-library/jest-dom';
import {getAllCollections, getCollection, createCollection, updateCollection, deleteCollections} from '../collections';
import axios from "axios"
import 'dotenv/config'
import { collectionId, collectionId2, collectionName, axiosError, getAllCollectionsMockReturnValue, getCollectionMockReturnValue, createCollectionMockReturnValue, collectionDescription, jwtToken, collectionCategories, updateCollectionMockReturnValue, deleteCollectionsMockReturnValue } from './utils/consts';

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("collections tests", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    });

    describe("getAllCollections tests", () => {
            it("should call axios.get with correct parameters and return correct artwork data if API call succeeds", async () => {
                mockAxios.get.mockResolvedValueOnce({ data: getAllCollectionsMockReturnValue });
    
                const result = await getAllCollections(1, 10, "asc", jwtToken);
    
    
                expect(mockAxios.get).toHaveBeenCalledWith(
                    `${process.env.REACT_APP_API_URL}v1/collection`,
                    {
                        params: {
                            page: 1,
                            pageSize: 10,
                            sortOrder: 'asc'
                        },
                        headers: {Authorization: `Bearer ${jwtToken}`}
                    }
                )
                expect(result).toEqual(getAllCollectionsMockReturnValue);
            });
    
            it("should throw error if API call fails", async () => {
                mockAxios.get.mockRejectedValueOnce(new Error("Network Error"));
    
                await expect(getAllCollections(1, 10, "asc")).rejects.toThrow(axiosError);
            });
    })

    describe("getCollection tests", () => {
            it("should call axios.get with correct parameters and return correct artwork data if API call succeeds", async () => {
                mockAxios.get.mockResolvedValueOnce({ data: getCollectionMockReturnValue });
    
                const result = await getCollection(collectionId);

                expect(mockAxios.get).toHaveBeenCalledWith(
                    `${process.env.REACT_APP_API_URL}v1/collection/${collectionId}`,
                    {
                        headers: {
                            'Content-Type': 'application/json; charset=UTF-8'
                        }
                    }
                )
                expect(result).toEqual(getCollectionMockReturnValue);
            });
    
            it("should throw error if API call fails", async () => {
                mockAxios.get.mockRejectedValueOnce(new Error("Network Error"));
    
                await expect(getCollection(collectionId)).rejects.toThrow(axiosError);
            });
    })

    describe("createCollection tests", () => {
        it("should call axios.post with correct parameters and return correct data if API call succeeds", async () => {
            mockAxios.post.mockResolvedValueOnce({ data: createCollectionMockReturnValue });

            const result = await createCollection(
                collectionName, 
                collectionDescription,
                collectionCategories,
                jwtToken,
                false
            );

            expect(mockAxios.post).toHaveBeenCalledWith(
                `${process.env.REACT_APP_API_URL}v1/collection/create`,
                {
                    name: collectionName,
                    description: collectionDescription,
                    categories: collectionCategories,
                    isCollectionPrivate: false
                },
                {headers: {Authorization: `Bearer ${jwtToken}`}}
            )
            expect(result).toEqual(createCollectionMockReturnValue);
        });

        it("should throw error if API call fails", async () => {
            mockAxios.post.mockRejectedValueOnce(new Error("Network Error"));

            await expect(createCollection(
                collectionName, 
                collectionDescription,
                collectionCategories,
                jwtToken,
                false
            )).rejects.toThrow(axiosError);
        });
    })

    describe("updateCollection tests", () => {
        it("should call axios.put with correct parameters and return correct data if API call succeeds", async () => {
            mockAxios.put.mockResolvedValueOnce({ data: updateCollectionMockReturnValue });

            const result = await updateCollection(
                collectionId,
                collectionName, 
                collectionDescription,
                collectionCategories,
                false,
                jwtToken
            );

            expect(mockAxios.put).toHaveBeenCalledWith(
                `${process.env.REACT_APP_API_URL}v1/collection/edit/${collectionId}`,
                {
                    name: collectionName,
                    description: collectionDescription,
                    categories: collectionCategories,
                    isCollectionPrivate: false
                },
                {headers: {Authorization: `Bearer ${jwtToken}`}}
            )
            expect(result).toEqual(updateCollectionMockReturnValue);
        });

        it("should throw error if API call fails", async () => {
            mockAxios.put.mockRejectedValueOnce(new Error("Network Error"));

            await expect(updateCollection(
                collectionId,
                collectionName, 
                collectionDescription,
                collectionCategories,
                false,
                jwtToken
            )).rejects.toThrow(axiosError);
        });
    })

    describe("deleteCollections tests", () => {
        it("should call axios.delete with correct parameters and return correct data if API call succeeds", async () => {
            mockAxios.delete.mockResolvedValueOnce({ data: deleteCollectionsMockReturnValue });

            const result = await deleteCollections([collectionId, collectionId2], jwtToken);

            expect(mockAxios.delete).toHaveBeenCalledWith(
                `${process.env.REACT_APP_API_URL}v1/collection/delete`,
                {
                    headers: { Authorization: `Bearer ${jwtToken}` },
                    data: { ids: [collectionId, collectionId2]}
                }
            )
            expect(result).toEqual(deleteCollectionsMockReturnValue);
        });

        it("should throw error if API call fails", async () => {
            mockAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

            await expect(deleteCollections([collectionId, collectionId2], jwtToken)).rejects.toThrow(axiosError);
        });
    })
})