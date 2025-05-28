import axios from "axios"
import { API_URL } from "../config"

export const getAllCategories = async (collectionIds: Array<string>) => {
    const params = new URLSearchParams();
    for (const collectionId of collectionIds) {
        params.append('collectionIds', collectionId);
    }
    const response = await axios.get(
        `${API_URL}v1/categories/all`,
        {
            headers: {
            'Content-Type': 'application/json; charset=UTF-8'
            },
            params
        }
    )
    return response.data
}