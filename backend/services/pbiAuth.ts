import { Request } from "express"

export type PbiAuth =
    | { type: "bearer", token: string }
    | { type: "api_key", apiKey: string }

export const resolvePbiAuth = (req: Request): PbiAuth => {
    const requestToken = req.header("X-PBI-Access-Token")
    if (requestToken) {
        return { type: "bearer", token: requestToken }
    }

    if (process.env.PBI_BEARER_TOKEN) {
        return { type: "bearer", token: process.env.PBI_BEARER_TOKEN }
    }

    if (process.env.PBI_API_KEY) {
        return { type: "api_key", apiKey: process.env.PBI_API_KEY }
    }

    throw new Error("PBI authorization is missing")
}

export const getPbiAuthStatus = (req: Request) => ({
    authMode: process.env.PBI_API_KEY ? "api_key" : process.env.PBI_BEARER_TOKEN ? "env_bearer_token" : "request_token",
    hasAuth: Boolean(req.header("X-PBI-Access-Token") || process.env.PBI_BEARER_TOKEN || process.env.PBI_API_KEY)
})
