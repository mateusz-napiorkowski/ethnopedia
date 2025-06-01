import '@testing-library/jest-dom';
import { getAllCategories } from '../categories';
import axios from "axios"
import 'dotenv/config'
import { collectionId, collectionId2, axiosError, getAllCategoriesMockReturnValue } from './utils/consts';

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("categories tests", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    });

    describe("getAllCategories tests", () => {
        it("should call axios.get with correct parameters and return correct artwork data if API call succeeds", async () => {
            mockAxios.get.mockResolvedValueOnce({ data: getAllCategoriesMockReturnValue });

            const result = await getAllCategories([collectionId, collectionId2]);
            const queryString = mockAxios.get.mock.calls[0][1]?.params.toString()


            expect(mockAxios.get).toHaveBeenCalledWith(
                `${process.env.REACT_APP_API_URL}v1/categories/all`,
                {
                    headers: {'Content-Type': 'application/json; charset=UTF-8'},
                    params: expect.any(URLSearchParams)
                }
            )
            expect(queryString).toBe(`collectionIds=${collectionId}&collectionIds=${collectionId2}`)
            expect(result).toEqual(getAllCategoriesMockReturnValue);
        });

        it("should throw error if API call fails", async () => {
            mockAxios.get.mockRejectedValueOnce(new Error("Network Error"));

            await expect(getAllCategories([collectionId])).rejects.toThrow(axiosError);
        });
    })
})