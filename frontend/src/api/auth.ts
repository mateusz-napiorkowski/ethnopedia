import axios from "axios"
import { API_URL } from "../config"
import { FormValues, LoginValues } from "../@types/Auth"

export const getUserById = async (id: string) => {
    return await axios
        .get(`${API_URL}v1/auth/${id}`)
        .then(res => res.data);
}

export const registerUser = async (userData: FormValues) => {
    return await axios
        .post(`${API_URL}v1/auth/register`, userData);
}

export const editUser = async (userData: FormValues, jwtToken: string) => {
    return await axios
        .post(`${API_URL}v1/auth/user-edit`, userData, { headers: {
                "Authorization": `Bearer ${jwtToken}`
            }});
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
