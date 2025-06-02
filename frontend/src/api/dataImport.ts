import axios from "axios"
import { API_URL } from "../config"

export const importData = async (importData: Array<Array<string>>, jwtToken: string, collectionId: string | undefined) => {
    return await axios.post(
        `${API_URL}v1/dataImport`,
        {importData, collectionId},
        { headers: { Authorization: `Bearer ${jwtToken}` }}
    ).then(res => res.data)
}

export const importDataAsCollection = async (importData: Array<Array<string>>, collectionName: string, description: string, jwtToken: string) => {
    return await axios.post(
        `${API_URL}v1/dataImport/${collectionName}`,
        {importData, collectionName, description},
        { headers: { Authorization: `Bearer ${jwtToken}` } }
    ).then(res => res.data)
}