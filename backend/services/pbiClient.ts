import { PbiAuth } from "./pbiAuth"
import { PbiAnnotationBodyItem, PbiRoPayload } from "./pbiPayloadBuilder"

export type PbiEnvironment = "dev" | "prod"

export const pbiEnvironments: Record<PbiEnvironment, { apiBaseUrl: string, keycloakIssuer: string }> = {
    dev: {
        apiBaseUrl: process.env.PBI_API_BASE_URL_DEV || "https://dariah-hub-dev.apps.dcw1.paas.psnc.pl/api",
        keycloakIssuer: process.env.PBI_KEYCLOAK_ISSUER_DEV || "https://keycloak-dev.pcss.pl/realms/pbi-dev"
    },
    prod: {
        apiBaseUrl: process.env.PBI_API_BASE_URL_PROD || "https://pbi.dariah.pl/api",
        keycloakIssuer: process.env.PBI_KEYCLOAK_ISSUER_PROD || "https://login.dariah.pl/realms/pbi"
    }
}

export const resolvePbiEnvironment = (env: unknown): PbiEnvironment => (env === "prod" ? "prod" : "dev")

export const pbiApiBaseUrl = (env: unknown = "dev") =>
    pbiEnvironments[resolvePbiEnvironment(env)].apiBaseUrl.replace(/\/$/, "")

export const pbiKeycloakIssuer = (env: unknown = "dev") =>
    pbiEnvironments[resolvePbiEnvironment(env)].keycloakIssuer

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

const pbiFetch = async (path: string, auth: PbiAuth, env: PbiEnvironment, init: RequestInit = {}) => {
    const headers = {
        ...authHeaders(auth),
        ...(init.headers || {}) as Record<string, string>,
    }
    return fetch(`${pbiApiBaseUrl(env)}${path}`, {
        ...init,
        headers
    })
}

export const checkPbiReachability = async (env: unknown = "dev") => {
    const response = await fetch(`${pbiApiBaseUrl(env)}/ros/`, { method: "GET" })
    return response.ok
}

export const createResearchObject = async (payload: PbiRoPayload, auth: PbiAuth, env: PbiEnvironment = "dev") => {
    const response = await pbiFetch("/ros/", auth, env, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    return parseResponse(response)
}

export const getResearchObjectFull = async (identifier: string, auth: PbiAuth, env: PbiEnvironment = "dev") => {
    const response = await pbiFetch(`/ros/${identifier}/full`, auth, env)
    return parseResponse(response)
}

export const getResearchObjectAnnotations = async (identifier: string, auth: PbiAuth, env: PbiEnvironment = "dev") => {
    const response = await pbiFetch(`/ros/${identifier}/annotations/full`, auth, env)
    return parseResponse(response)
}

export const findByEthnopediaId = async (ethnopediaArtworkId: string, auth: PbiAuth, env: PbiEnvironment = "dev") => {
    const params = new URLSearchParams({
        predicate: "http://purl.org/dc/terms/identifier",
        object: ethnopediaArtworkId
    })
    const response = await pbiFetch(`/triples?${params.toString()}`, auth, env)
    return parseResponse(response)
}

export const addAnnotation = async (
    roIdentifier: string,
    bodySpecificationJson: PbiAnnotationBodyItem[],
    auth: PbiAuth,
    env: PbiEnvironment = "dev"
) => {
    const response = await pbiFetch("/annotations/", auth, env, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ro: roIdentifier,
            body_specification_json: bodySpecificationJson
        })
    })
    return parseResponse(response)
}
