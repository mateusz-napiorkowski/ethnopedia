import axios from "axios"
import { API_URL } from "../config"

export const getAllCategories = async (collectionId: string) => {
    const response = await axios.get(`${API_URL}v1/categories/all/${collectionId}`, {headers: {
        'Content-Type': 'application/json; charset=UTF-8'
    }})
    return response.data
}