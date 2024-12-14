import axios from "axios"
import { API_URL } from "../config"

export const getAllCategories = async (collection: string) => {
    const response = await axios.get(`${API_URL}v1/categories/all/${collection}`)
    return response.data
}