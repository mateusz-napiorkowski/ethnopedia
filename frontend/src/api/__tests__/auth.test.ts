import '@testing-library/jest-dom';
import { registerUser, deleteAccount, loginUser } from '../auth';
import axios from "axios"
import 'dotenv/config'
import { axiosError, deleteAccountReturnValue, jwtToken, loginUserFormData, loginUserReturnData, registerUserFormData, registerUserReturnData, userId } from './utils/consts';

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("auth tests", () => {
    beforeEach(() => {
        jest.clearAllMocks()
    });

    describe("registerUser tests", () => {
        it("should call axios.post with correct parameters and return correct data if API call succeeds", async () => {
            mockAxios.post.mockResolvedValueOnce(registerUserReturnData);

            const result = await registerUser(registerUserFormData);

            expect(mockAxios.post).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}v1/auth/register`, registerUserFormData)
            expect(result).toEqual(registerUserReturnData);
        });

        it("should throw error if API call fails", async () => {
            mockAxios.post.mockRejectedValueOnce(new Error("Network Error"));

            await expect(registerUser(registerUserFormData)).rejects.toThrow(axiosError);
        });
    })

    describe("loginUser tests", () => {
        it("should call axios.post with correct parameters and return correct data if API call succeeds", async () => {
            mockAxios.post.mockResolvedValueOnce({data: loginUserReturnData});

            const result = await loginUser(loginUserFormData);

            expect(mockAxios.post).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL}v1/auth/login`, loginUserFormData)
            expect(result).toEqual(loginUserReturnData);
        });

        it("should throw error if API call fails", async () => {
            mockAxios.post.mockRejectedValueOnce(new Error("Network Error"));

            await expect(loginUser(loginUserFormData)).rejects.toThrow(axiosError);
        });
    })

    describe("deleteAccount tests", () => {
        it("should call axios.delete with correct parameters and return correct data if API call succeeds", async () => {
            mockAxios.delete.mockResolvedValueOnce({data: deleteAccountReturnValue});

            const result = await deleteAccount(userId, jwtToken);

            expect(mockAxios.delete).toHaveBeenCalledWith(
                `${process.env.REACT_APP_API_URL}v1/auth/${userId}`,
                {headers: {"Authorization": `Bearer ${jwtToken}` }}
            )
            expect(result).toEqual(deleteAccountReturnValue);
        });

        it("should throw error if API call fails", async () => {
            mockAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

            await expect(deleteAccount(userId, jwtToken)).rejects.toThrow(axiosError);
        });
    })
})