import axios from "axios"
import { useMutation } from "react-query"
import { API_URL } from "../config"

type FormValues = {
    username: string
    firstName: string,
    password: string
}

type LoginValues = {
    username: string
    password: string
}

export const registerUser = async (userData: FormValues) => {
    return await axios.post(`${API_URL}v1/auth/register`, userData)
}

export const useLoginMutation = () => {
    return useMutation((userData: LoginValues) => axios.post(`${API_URL}v1/auth/login`, userData))
}

export const deleteAccount = async (id: string, jwtToken: string) => {
    const response = await axios.delete(`${API_URL}v1/auth/${id}`, { headers: { "Authorization": `Bearer ${jwtToken}` } })
    return response.data
}
