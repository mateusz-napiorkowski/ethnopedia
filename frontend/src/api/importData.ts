import axios from "axios"
import { API_URL } from "../config"

export const importData = async (importData: any, jwtToken: any, collectionName: any) => {
    const config = {
        headers: { Authorization: `Bearer ${jwtToken}` }
    };
    return await axios
        .post(`${API_URL}v1/import`, {importData, collectionName}, config)
        .then(res => res.data)
}