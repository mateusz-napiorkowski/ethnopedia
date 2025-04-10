import axios from "axios"
import { API_URL } from "../config"

export const importData = async (importData: Array<Array<string>>, jwtToken: any, collectionId: string | undefined) => {
    const config = {
        headers: { Authorization: `Bearer ${jwtToken}` }
    };
    return await axios
        .post(`${API_URL}v1/dataImport`, {importData, collectionId}, config)
        .then(res => res.data)
}

export const importDataAsCollection = async (importData: Array<Array<string>>, collectionName: string, description: string, jwtToken: string) => {
    const config = {
        headers: { Authorization: `Bearer ${jwtToken}` }
    };
    return await axios
        .post(`${API_URL}v1/dataImport/${collectionName}`, {importData, collectionName, description}, config)
        .then(res => res.data)
}