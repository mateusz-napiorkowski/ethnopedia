import axios from "axios"
import { API_URL } from "../config"
import { FormValues, LoginValues } from "../@types/Auth"

export const registerUser = async (userData: FormValues) => {
    return await axios
        .post(`${API_URL}v1/auth/register`, userData);
}

export const loginUser = async (userData: LoginValues) => {
    return await axios
        .post(`${API_URL}v1/auth/login`, userData)
        .then(res => res.data);
}

export const deleteAccount = async (id: string, jwtToken: string) => {
    return await axios
        .delete(
            `${API_URL}v1/auth/${id}`,
            { headers: {
                "Authorization": `Bearer ${jwtToken}`
            }}
        )
        .then((res) => res.data);
}
