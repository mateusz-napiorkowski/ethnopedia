import '@testing-library/jest-dom';
import { getArtwork } from '../artworks';
import axios from "axios"
import 'dotenv/config'

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

const artworkId = "66ce0bf156199c1b8df5db7d"
const collectionName = "collection"

const axiosError = {
    "message": "Network Error",
    "name": "AxiosError",   
}

describe("artworks tests", () => {
    describe("getArtwork tests", () => {
        it("should call axios.get with correct url and return correct artwork data if API call succeeds", async () => {
            const axiosGetArtworkMockData = { 
                artwork: {
                    _id: artworkId,
                    createdAt: '2024-10-22T20:12:12.209Z',
                    updatedAt: '2024-10-22T20:12:12.209Z',
                    __v: 0,
                    categories: [
                        {
                            name: 'Tytuł',
                            value: 'testowy',
                            subcategories: []
                        },
                    ],
                    collectionName: collectionName
                },
            };
            mockAxios.get.mockResolvedValueOnce({ data: axiosGetArtworkMockData });

            const result = await getArtwork(artworkId);

            expect(mockAxios.get).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}v1/artworks/${artworkId}`)
            expect(result).toEqual(axiosGetArtworkMockData);
        });

        it("should throw error if API call fails", async () => {
            mockAxios.get.mockRejectedValueOnce(new Error("Network Error"));

            await expect(getArtwork(artworkId)).rejects.toThrow(axiosError);
        });
    })
    
});