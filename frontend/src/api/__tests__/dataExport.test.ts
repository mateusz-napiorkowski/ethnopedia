import '@testing-library/jest-dom';
import {getXlsxWithArtworksData, getXlsxWithCollectionData} from '../dataExport';
import axios from "axios"
import 'dotenv/config'
import { collectionId, axiosError } from './utils/consts';
import {ExportExtent} from "../../@types/DataExport"

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

(global.URL.createObjectURL as jest.Mock) = jest.fn(() => 'blob:http://localhost/fake-blob-url');
(global.URL.revokeObjectURL as jest.Mock) = jest.fn();

describe("dataExport tests", () => {
    beforeEach(() => {   
        jest.clearAllMocks()
    });

    describe("getXlsxWithArtworksData tests", () => {
        it("should call axios.get with correct parameters", async () => {
            mockAxios.get.mockResolvedValueOnce({  });

            const result = await getXlsxWithArtworksData(
                [collectionId],
                ["Tytuł"],
                ExportExtent.all,
                {},
                new URLSearchParams(),
                "test.xlsx",
                false,
                false
            );


            expect(mockAxios.get).toHaveBeenCalledWith(
                `${process.env.REACT_APP_API_URL}v1/dataExport`,
                {
                    responseType: "blob",
                    params: {
                        collectionIds: [collectionId],
                        columnNames: ["Tytuł"],
                        exportExtent: "all",  
                        selectedArtworks: []
                    },
                    
                }
            )
        });

        it("should throw error if API call fails", async () => {
            mockAxios.get.mockRejectedValueOnce(new Error("Network Error"));

            await expect(getXlsxWithArtworksData(
                [collectionId],
                ["Tytuł"],
                ExportExtent.all,
                {},
                new URLSearchParams(),
                "test.xlsx",
                false,
                false
            )).rejects.toThrow(axiosError);
        });
    })

    describe("getXlsxWithCollectionData tests", () => {
        it("should call axios.get with correct parameters", async () => {
            mockAxios.get.mockResolvedValueOnce({  });

            const result = await getXlsxWithCollectionData(collectionId);

            expect(mockAxios.get).toHaveBeenCalledWith(
                `${process.env.REACT_APP_API_URL}v1/dataExport/collection/${collectionId}`,
                {
                    responseType: "blob",                    
                }
            )
        });

        it("should throw error if API call fails", async () => {
            mockAxios.get.mockRejectedValueOnce(new Error("Network Error"));

            await expect(getXlsxWithCollectionData(collectionId)).rejects.toThrow(axiosError);
        });
    })
})