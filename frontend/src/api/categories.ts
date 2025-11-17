import axios from "axios"
import { API_URL } from "../config"

export const getAllCategories = async (collectionIds: Array<string>, jwtToken: string | undefined = undefined) => {
    return await axios.get(
        `${API_URL}v1/categories/all`,
        {
            headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            "Authorization": jwtToken ? `Bearer ${jwtToken}` : undefined 
            },
            params: new URLSearchParams(collectionIds.map(id => ['collectionIds', id]))
        }
    ).then((res) => res.data);
}