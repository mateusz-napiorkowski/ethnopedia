import axios from "axios"
import { API_URL } from "../config"
import { PbiMapperConfig, PbiSyncOptions } from "../@types/Pbi"

const pbiHeaders = (jwtToken?: string, pbiAccessToken?: string) => ({
    ...(jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}),
    ...(pbiAccessToken ? { "X-PBI-Access-Token": pbiAccessToken } : {})
})

export const getPbiStatus = async (jwtToken?: string, pbiAccessToken?: string) => {
    return axios
        .get(`${API_URL}v1/pbi/status`, { headers: pbiHeaders(jwtToken, pbiAccessToken) })
        .then(res => res.data)
}

export const getPbiCollectionPreview = async (collectionId: string, jwtToken?: string) => {
    return axios
        .get(`${API_URL}v1/pbi/collections/${collectionId}/preview`, { headers: pbiHeaders(jwtToken) })
        .then(res => res.data)
}

export const previewPbiSync = async (
    collectionId: string,
    mapperConfig: PbiMapperConfig,
    jwtToken?: string,
    limit: number = 3
) => {
    return axios
        .post(
            `${API_URL}v1/pbi/collections/${collectionId}/sync/preview`,
            { mapperConfig, limit },
            { headers: pbiHeaders(jwtToken) }
        )
        .then(res => res.data)
}

export const startPbiSync = async (
    collectionId: string,
    mapperConfig: PbiMapperConfig,
    options: PbiSyncOptions,
    jwtToken: string,
    pbiAccessToken?: string
) => {
    return axios
        .post(
            `${API_URL}v1/pbi/collections/${collectionId}/sync`,
            { mapperConfig, ...options },
            { headers: pbiHeaders(jwtToken, pbiAccessToken) }
        )
        .then(res => res.data)
}

export const getPbiSyncs = async (collectionId: string, jwtToken?: string) => {
    return axios
        .get(`${API_URL}v1/pbi/syncs`, {
            params: { collectionId },
            headers: pbiHeaders(jwtToken)
        })
        .then(res => res.data)
}
