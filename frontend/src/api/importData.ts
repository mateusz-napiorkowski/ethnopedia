import axios from "axios"
import { API_URL } from "../config"
import { useMutation } from "react-query"

export const importData = async (importData: any, collectionName: any) => {
    return await axios
        .post(`${API_URL}v1/import`, {importData, collectionName})
        .then(res => res.data)
}