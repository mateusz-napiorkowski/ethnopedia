import { Request } from "express"
import { PbiEnvironment, resolvePbiEnvironment } from "./pbiClient"

export type PbiAuth =
    | { type: "bearer", token: string }
    | { type: "api_key", apiKey: string }

const envBearerToken = (env: PbiEnvironment) =>
    env === "prod" ? process.env.PBI_BEARER_TOKEN_PROD : process.env.PBI_BEARER_TOKEN_DEV

const envApiKey = (env: PbiEnvironment) =>
    env === "prod" ? process.env.PBI_API_KEY_PROD : process.env.PBI_API_KEY_DEV

export const resolvePbiAuth = (req: Request): PbiAuth => {
    const env = resolvePbiEnvironment(req.header("X-PBI-Environment") || req.body?.environment)
    const requestToken = req.header("X-PBI-Access-Token")
    if (requestToken) {
        return { type: "bearer", token: requestToken }
    }

    const bearerToken = envBearerToken(env)
    if (bearerToken) {
        return { type: "bearer", token: bearerToken }
    }

    const apiKey = envApiKey(env)
    if (apiKey) {
        return { type: "api_key", apiKey }
    }

    throw new Error("PBI authorization is missing")
}

export const getPbiAuthStatus = (req: Request) => {
    const env = resolvePbiEnvironment(req.header("X-PBI-Environment") || req.query.environment)
    const hasApiKey = Boolean(envApiKey(env))
    const hasBearer = Boolean(envBearerToken(env))
    return {
        environment: env,
        authMode: hasApiKey ? "api_key" : hasBearer ? "env_bearer_token" : "request_token",
        hasAuth: Boolean(req.header("X-PBI-Access-Token") || hasBearer || hasApiKey)
    }
}
