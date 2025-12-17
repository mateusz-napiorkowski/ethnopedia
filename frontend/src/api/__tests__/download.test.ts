import '@testing-library/jest-dom';
import {downloadFile} from '../download';
import axios from "axios"
import 'dotenv/config'
import { axiosError, fileToDownloadData } from './utils/consts';

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

(global.URL.createObjectURL as jest.Mock) = jest.fn(() => 'blob:http://localhost/fake-blob-url');
(global.URL.revokeObjectURL as jest.Mock) = jest.fn();

describe("dataImport tests", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    });

    describe("importData tests", () => {
        it("should call axios.get with correct parameters and return correct data", async () => {
            mockAxios.get.mockResolvedValueOnce({ });

            const result = await downloadFile(
                fileToDownloadData
            );

            expect(mockAxios.get).toHaveBeenCalledWith(
                `${process.env.REACT_APP_API_URL}v1/${fileToDownloadData.filePath}`,
                {responseType: "blob"}
            )
        });

        it("should throw error if API call fails", async () => {
            mockAxios.get.mockRejectedValueOnce(new Error("Network Error"));

            await expect(downloadFile(fileToDownloadData)).rejects.toThrow(axiosError);
        });
    })
})