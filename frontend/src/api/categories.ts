import axios from "axios"
import { API_URL } from "../config"

export const getCategories = async (id: string) => {
    const response = await axios.get(`${API_URL}v1/categories/${id}`)
    return response.data
}

export const getAllCategories = async (collection: string) => {
    const response = await axios.get(`${API_URL}v1/categories/all/${collection}`)
    return response.data
}