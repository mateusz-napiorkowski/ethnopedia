import { PbiAuth } from "./pbiAuth"
import { PbiAnnotationBodyItem, PbiRoPayload } from "./pbiPayloadBuilder"

const defaultPbiApiBaseUrl = "https://dariah-hub-dev.apps.dcw1.paas.psnc.pl/api"

export const pbiApiBaseUrl = () => (process.env.PBI_API_BASE_URL || defaultPbiApiBaseUrl).replace(/\/$/, "")

const authHeaders = (auth: PbiAuth): Record<string, string> => {
    if (auth.type === "bearer") {
        return { Authorization: `Bearer ${auth.token}` }
    }
    return { "PBI-API-KEY": auth.apiKey }
}

const parseResponse = async (response: Response) => {
    const contentType = response.headers.get("content-type") || ""
    const body = contentType.includes("application/json")
        ? await response.json()
        : await response.text()

    if (!response.ok) {
        const detail = typeof body === "string" ? body : JSON.stringify(body)
        throw new Error(`PBI request failed with ${response.status}: ${detail}`)
    }

    return body
}

const pbiFetch = async (path: string, auth: PbiAuth, init: RequestInit = {}) => {
    const headers = {
        ...authHeaders(auth),
        ...(init.headers || {}) as Record<string, string>,
    }
    return fetch(`${pbiApiBaseUrl()}${path}`, {
        ...init,
        headers
    })
}

export const checkPbiReachability = async () => {
    const response = await fetch(`${pbiApiBaseUrl()}/ros/`, { method: "GET" })
    return response.ok
}

export const createResearchObject = async (payload: PbiRoPayload, auth: PbiAuth) => {
    const response = await pbiFetch("/ros/", auth, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    return parseResponse(response)
}

export const getResearchObjectFull = async (identifier: string, auth: PbiAuth) => {
    const response = await pbiFetch(`/ros/${identifier}/full`, auth)
    return parseResponse(response)
}

export const getResearchObjectAnnotations = async (identifier: string, auth: PbiAuth) => {
    const response = await pbiFetch(`/ros/${identifier}/annotations/full`, auth)
    return parseResponse(response)
}

export const findByEthnopediaId = async (ethnopediaArtworkId: string, auth: PbiAuth) => {
    const params = new URLSearchParams({
        predicate: "http://purl.org/dc/terms/identifier",
        object: ethnopediaArtworkId
    })
    const response = await pbiFetch(`/triples?${params.toString()}`, auth)
    return parseResponse(response)
}

export const addAnnotation = async (
    roIdentifier: string,
    bodySpecificationJson: PbiAnnotationBodyItem[],
    auth: PbiAuth
) => {
    const response = await pbiFetch("/annotations/", auth, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ro: roIdentifier,
            body_specification_json: bodySpecificationJson
        })
    })
    return parseResponse(response)
}
