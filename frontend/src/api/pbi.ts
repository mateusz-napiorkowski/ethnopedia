import axios from "axios"
import { API_URL } from "../config"
import { PbiEnvironment, PbiMapperConfig, PbiSyncOptions } from "../@types/Pbi"

const pbiHeaders = (environment: PbiEnvironment, jwtToken?: string, pbiAccessToken?: string) => ({
    "X-PBI-Environment": environment,
    ...(jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}),
    ...(pbiAccessToken ? { "X-PBI-Access-Token": pbiAccessToken } : {})
})

export const getPbiStatus = async (environment: PbiEnvironment, jwtToken?: string, pbiAccessToken?: string) => {
    return axios
        .get(`${API_URL}v1/pbi/status`, {
            params: { environment },
            headers: pbiHeaders(environment, jwtToken, pbiAccessToken)
        })
        .then(res => res.data)
}

export const getPbiCollectionPreview = async (collectionId: string, jwtToken?: string) => {
    return axios
        .get(`${API_URL}v1/pbi/collections/${collectionId}/preview`, { headers: jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {} })
        .then(res => res.data)
}

export const previewPbiSync = async (
    collectionId: string,
    environment: PbiEnvironment,
    mapperConfig: PbiMapperConfig,
    jwtToken?: string,
    limit: number = 3
) => {
    return axios
        .post(
            `${API_URL}v1/pbi/collections/${collectionId}/sync/preview`,
            { environment, mapperConfig, limit },
            { headers: pbiHeaders(environment, jwtToken) }
        )
        .then(res => res.data)
}

export const startPbiSync = async (
    collectionId: string,
    environment: PbiEnvironment,
    mapperConfig: PbiMapperConfig,
    options: PbiSyncOptions,
    jwtToken: string,
    pbiAccessToken?: string
) => {
    return axios
        .post(
            `${API_URL}v1/pbi/collections/${collectionId}/sync`,
            { environment, mapperConfig, ...options },
            { headers: pbiHeaders(environment, jwtToken, pbiAccessToken) }
        )
        .then(res => res.data)
}

export const getPbiSyncs = async (collectionId: string, environment: PbiEnvironment, jwtToken?: string) => {
    return axios
        .get(`${API_URL}v1/pbi/syncs`, {
            params: { collectionId, environment },
            headers: jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}
        })
        .then(res => res.data)
}
