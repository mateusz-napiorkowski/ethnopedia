import '@testing-library/jest-dom';
import {importData, importDataAsCollection} from '../dataImport';
import axios from "axios"
import 'dotenv/config'
import { collectionId, collectionName, axiosError, collectionDescription, jwtToken, dataToImport, importDataMockReturnValue, importDataAsCollectionMockReturnData } from './utils/consts';

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("dataImport tests", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    });

    describe("importData tests", () => {
        it("should call axios.post with correct parameters and return correct data if API call succeeds", async () => {
            mockAxios.post.mockResolvedValueOnce({ data: importDataMockReturnValue });

            const result = await importData(
                dataToImport,
                jwtToken,
                collectionId
            );

            expect(mockAxios.post).toHaveBeenCalledWith(
                `${process.env.REACT_APP_API_URL}v1/dataImport`,
                {
                    importData: dataToImport,
                    collectionId: collectionId
                },
                {headers: {Authorization: `Bearer ${jwtToken}`}}
            )
            expect(result).toEqual(importDataMockReturnValue);
        });

        it("should throw error if API call fails", async () => {
            mockAxios.post.mockRejectedValueOnce(new Error("Network Error"));

            await expect(importData(dataToImport, jwtToken, collectionId)).rejects.toThrow(axiosError);
        });
    })

    describe("importDataAsCollection tests", () => {
        it("should call axios.post with correct parameters and return correct data if API call succeeds", async () => {
            mockAxios.post.mockResolvedValueOnce({ data: importDataAsCollectionMockReturnData });

            const result = await importDataAsCollection(
                dataToImport,
                collectionName,
                collectionDescription,
                jwtToken
            );

            expect(mockAxios.post).toHaveBeenCalledWith(
                `${process.env.REACT_APP_API_URL}v1/dataImport/${collectionName}`,
                {
                    importData: dataToImport,
                    collectionName: collectionName,
                    description: collectionDescription
                },
                {headers: {Authorization: `Bearer ${jwtToken}`}}
            )
            expect(result).toEqual(importDataAsCollectionMockReturnData);
        });

        it("should throw error if API call fails", async () => {
            mockAxios.post.mockRejectedValueOnce(new Error("Network Error"));

            await expect(importDataAsCollection(dataToImport, collectionName, collectionDescription, jwtToken)).rejects.toThrow(axiosError);
        });
    })
})