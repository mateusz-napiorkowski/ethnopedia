import '@testing-library/jest-dom';
import { createArtwork, editArtwork, getArtwork, getArtworksForPage, deleteArtworks } from '../artworks';
import axios from "axios"
import 'dotenv/config'
import { artworkId, collectionId, axiosError, getArtworkMockReturnValue, getArtworkForPageMockReturnValue, jwtToken, artworkPayload, createArtworkMockReturnValue, editArtworkReturnValue, deleteArtworksReturnValue } from './utils/consts';

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("artworks tests", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    });

    describe("getArtwork tests", () => {
        it("should call axios.get with correct parameters and return correct artwork data if API call succeeds", async () => {
            mockAxios.get.mockResolvedValueOnce({ data: getArtworkMockReturnValue });

            const result = await getArtwork(artworkId);

            expect(mockAxios.get).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}v1/artworks/${artworkId}`)
            expect(result).toEqual(getArtworkMockReturnValue);
        });

        it("should throw error if API call fails", async () => {
            mockAxios.get.mockRejectedValueOnce(new Error("Network Error"));

            await expect(getArtwork(artworkId)).rejects.toThrow(axiosError);
        });
    })

    describe("getArtworksForPage tests", () => {
        it.each([
            {case: "no search", search: false, searchText: null, searchRules: {}},
            {case: "quick search", search: true, searchText: "testowy", searchRules: {}},
            {case: "advanced search", search: true, searchText: null, searchRules: {"Tytuł": "testowy"}},       
        ])('should call axios.get with correct parameters and return correct data if API call succeeds - $case', async ({search, searchText, searchRules: searchRules}) => {
            
            mockAxios.get.mockResolvedValueOnce({ data: getArtworkForPageMockReturnValue });
            const queryParams = {
                params: {
                    "collectionIds": ["66f2194a6123d7f50558cd8f"],
                    "page": 1,
                    "pageSize": 10,
                    "search": search,
                    "searchText": searchText,
                    "sortOrder": "Tytuł-asc",
                    ...searchRules
                }
            }

            const result = await getArtworksForPage(
                queryParams.params.collectionIds,
                queryParams.params.page,
                queryParams.params.pageSize,
                queryParams.params.sortOrder,
                queryParams.params.searchText,
                searchRules
            );

            expect(mockAxios.get).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}v1/artworks/`, queryParams)
            expect(result).toEqual(getArtworkForPageMockReturnValue);    
        })

        it("should throw error if API call fails", async () => {
            mockAxios.get.mockRejectedValueOnce(new Error("Network Error"));

            await expect(getArtworksForPage([collectionId], 1, 10, "Tytuł-asc", null, {Tytuł: 'testowy'})).rejects.toThrow(axiosError);
        });
    })

    describe("createArtwork tests", () => {
        it("should call axios.post with correct parameters and return correct data if API call succeeds", async () => {
            mockAxios.post.mockResolvedValueOnce({ data: createArtworkMockReturnValue });

            const result = await createArtwork(artworkPayload, jwtToken);

            expect(mockAxios.post).toHaveBeenCalledWith(
                `${process.env.REACT_APP_API_URL}v1/artworks/create`,
                artworkPayload,
                {headers: {Authorization: `Bearer ${jwtToken}`}}
            )
            expect(result).toEqual(createArtworkMockReturnValue);
        });

        it("should throw error if API call fails", async () => {
            mockAxios.post.mockRejectedValueOnce(new Error("Network Error"));

            await expect(createArtwork(artworkPayload, jwtToken)).rejects.toThrow(axiosError);
        });
    })

    describe("editArtwork tests", () => {
        it("should call axios.put with correct parameters and return correct data if API call succeeds", async () => {
            mockAxios.put.mockResolvedValueOnce({ data: editArtworkReturnValue });

            const result = await editArtwork(artworkPayload, artworkId, jwtToken)

            expect(mockAxios.put).toHaveBeenCalledWith(
                `${process.env.REACT_APP_API_URL}v1/artworks/edit/${artworkId}`,
                artworkPayload,
                {headers: {Authorization: `Bearer ${jwtToken}`}}
            )
            expect(result).toEqual(editArtworkReturnValue);
        });

        it("should throw error if API call fails", async () => {
            mockAxios.put.mockRejectedValueOnce(new Error("Network Error"));

            await expect(editArtwork(artworkPayload, artworkId, jwtToken)).rejects.toThrow(axiosError);
        });
    })

    describe("deleteArtworks tests", () => {
        it("should call axios.delete with correct parameters and return correct data if API call succeeds", async () => {
            mockAxios.delete.mockResolvedValueOnce({ data: deleteArtworksReturnValue });

            const result = await deleteArtworks([artworkId], jwtToken)

            expect(mockAxios.delete).toHaveBeenCalledWith(
                `${process.env.REACT_APP_API_URL}v1/artworks/delete`,
                {
                    headers: {Authorization: `Bearer ${jwtToken}`},
                    data: {ids: [artworkId]}
                }
            )
            expect(result).toEqual(deleteArtworksReturnValue);
        });

        it("should throw error if API call fails", async () => {
            mockAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

            await expect(deleteArtworks([artworkId], jwtToken)).rejects.toThrow(axiosError);
        });
    })
});