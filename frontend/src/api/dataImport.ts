import axios from "axios"
import { API_URL } from "../config"

export const importData = async (
    importData: string[][],
    jwtToken: string,
    collectionId: string
) => {
    return await axios
        .post(
            `${API_URL}v1/dataImport`,
            {importData, collectionId},
            { headers: { Authorization: `Bearer ${jwtToken}` }}
        )
        .then(res => res.data);
}

export const importDataAsCollection = async (
    importData: string[][],
    collectionName: string,
    description: string,
    jwtToken: string,
    archiveFile: File | undefined,
    isCollectionPrivate: boolean
) => {
    const formData = new FormData();
    formData.append("importData", JSON.stringify(importData));
    formData.append("collectionName", collectionName);
    formData.append("description", description);
    if(archiveFile)
        formData.append("file", archiveFile);
    formData.append("isCollectionPrivate", JSON.stringify(isCollectionPrivate));

    return await axios
        .post(
            `${API_URL}v1/dataImport/newCollection`,
            formData,
            { headers: { Authorization: `Bearer ${jwtToken}` } }
        )
        .then(res => res.data);
}