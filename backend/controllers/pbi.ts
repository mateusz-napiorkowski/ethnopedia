import { Request, Response } from "express"
import CollectionCollection from "../models/collection"
import Artwork from "../models/artwork"
import PbiSync from "../models/pbiSync"
import { authAsyncWrapper } from "../middleware/auth"
import { verifyToken } from "../utils/auth"
import { flattenArtworkCategories } from "../utils/pbi-mapper"
import { buildPbiPayloads, defaultPbiMapperConfig, PbiMapperConfig } from "../services/pbiPayloadBuilder"
import { getPbiAuthStatus, resolvePbiAuth } from "../services/pbiAuth"
import { addAnnotation, checkPbiReachability, createResearchObject, pbiApiBaseUrl } from "../services/pbiClient"

const keycloakIssuer = "https://keycloak-dev.pcss.pl/realms/pbi-dev"
const maxSyncLimit = 50

const getCollectionOrThrow = async (collectionId: string) => {
    const collection = await CollectionCollection.findOne({ _id: collectionId }).exec()
    if (!collection) {
        throw new Error("Collection not found")
    }
    return collection
}

const ensureCollectionAccess = (collection: any, authorizationHeader: string | undefined) => {
    if (collection.isPrivate) {
        verifyToken(authorizationHeader)
    }
}

const getArtworksForCollection = async (
    collectionId: string,
    collectionName: string,
    limit?: number,
    onlyArtworkIds?: string[]
) => {
    const filter: any = {
        $or: [
            { collectionId },
            { collectionName }
        ]
    }
    if (onlyArtworkIds && onlyArtworkIds.length > 0) {
        filter._id = { $in: onlyArtworkIds }
    }

    const query = Artwork.find(filter).sort({ createdAt: 1 })
    if (limit) {
        query.limit(limit)
    }
    return query.exec()
}

const sanitizeLimit = (limit: unknown, defaultLimit = 5) => {
    const parsed = Number(limit || defaultLimit)
    if (!Number.isFinite(parsed) || parsed < 1) {
        return defaultLimit
    }
    return Math.min(Math.floor(parsed), maxSyncLimit)
}

const normalizeMapperConfig = (mapperConfig: Partial<PbiMapperConfig> | undefined): PbiMapperConfig => ({
    ...defaultPbiMapperConfig,
    ...(mapperConfig || {}),
    researchAreas: mapperConfig?.researchAreas || defaultPbiMapperConfig.researchAreas,
    annotationMappings: mapperConfig?.annotationMappings || []
})

const getSyncPreviewItems = async (req: Request, res: Response, dryRun: boolean) => {
    try {
        const collection = await getCollectionOrThrow(req.params.collectionId)
        ensureCollectionAccess(collection, req.headers.authorization)
        const limit = sanitizeLimit(req.body.limit, dryRun ? 3 : 5)
        const mapperConfig = normalizeMapperConfig(req.body.mapperConfig)
        const artworks = await getArtworksForCollection(
            req.params.collectionId,
            collection.name as string,
            limit,
            req.body.onlyArtworkIds
        )

        const items = artworks.map((artwork: any) => {
            const payloads = buildPbiPayloads(artwork, mapperConfig, collection.name as string)
            return {
                ethnopediaArtworkId: payloads.ethnopediaArtworkId,
                flatCategories: payloads.flatCategories,
                roPayload: payloads.roPayload,
                annotationPayload: {
                    ro: "<PBI_RO_IDENTIFIER>",
                    body_specification_json: payloads.annotationBody
                },
                payloadHash: payloads.payloadHash
            }
        })

        return res.status(200).json({ dryRun, collectionId: req.params.collectionId, items })
    } catch (error) {
        const err = error as Error
        console.error(error)
        if (err.message === "Collection not found") {
            return res.status(404).json({ error: err.message })
        }
        if (err.message === "No token provided" || err.message === "Access denied") {
            return res.status(401).json({ error: err.message })
        }
        return res.status(503).json({ error: "Database unavailable" })
    }
}

export const getPbiStatus = async (req: Request, res: Response) => {
    const authStatus = getPbiAuthStatus(req)
    try {
        const pbiReachable = await checkPbiReachability()
        return res.status(200).json({
            pbiApiBaseUrl: pbiApiBaseUrl(),
            keycloakIssuer,
            pbiReachable,
            ...authStatus
        })
    } catch (error) {
        console.error(error)
        return res.status(200).json({
            pbiApiBaseUrl: pbiApiBaseUrl(),
            keycloakIssuer,
            pbiReachable: false,
            ...authStatus
        })
    }
}

export const getPbiCollectionPreview = async (req: Request, res: Response) => {
    try {
        const collection = await getCollectionOrThrow(req.params.collectionId)
        ensureCollectionAccess(collection, req.headers.authorization)
        const artworks = await getArtworksForCollection(req.params.collectionId, collection.name as string, 5)
        const fieldSet = new Set<string>()
        const sampleArtworks = artworks.map((artwork: any) => {
            const flatCategories = flattenArtworkCategories(artwork.categories || [])
            Object.keys(flatCategories).forEach(field => fieldSet.add(field))
            return {
                id: artwork._id.toString(),
                flatCategories
            }
        })

        return res.status(200).json({
            collection: {
                id: collection._id.toString(),
                name: collection.name,
                description: collection.description
            },
            fields: Array.from(fieldSet).sort((a, b) => a.localeCompare(b)),
            sampleArtworks
        })
    } catch (error) {
        const err = error as Error
        console.error(error)
        if (err.message === "Collection not found") {
            return res.status(404).json({ error: err.message })
        }
        if (err.message === "No token provided" || err.message === "Access denied") {
            return res.status(401).json({ error: err.message })
        }
        return res.status(503).json({ error: "Database unavailable" })
    }
}

export const previewPbiSync = async (req: Request, res: Response) => getSyncPreviewItems(req, res, true)

export const syncCollectionToPbi = authAsyncWrapper(async (req: Request, res: Response) => {
    try {
        const auth = resolvePbiAuth(req)
        const collection = await getCollectionOrThrow(req.params.collectionId)
        const limit = sanitizeLimit(req.body.limit, 1)
        const force = req.body.force === true
        const mapperConfig = normalizeMapperConfig(req.body.mapperConfig)
        const artworks = await getArtworksForCollection(
            req.params.collectionId,
            collection.name as string,
            limit,
            req.body.onlyArtworkIds
        )

        const items = []
        let synced = 0
        let skipped = 0
        let failed = 0

        for (const artwork of artworks as any[]) {
            const payloads = buildPbiPayloads(artwork, mapperConfig, collection.name as string)
            try {
                const existingSync: any = await PbiSync.findOne({ ethnopediaArtworkId: payloads.ethnopediaArtworkId }).exec()
                if (existingSync && existingSync.status === "synced" && existingSync.payloadHash === payloads.payloadHash && !force) {
                    skipped += 1
                    items.push({
                        ethnopediaArtworkId: payloads.ethnopediaArtworkId,
                        pbiRoIdentifier: existingSync.pbiRoIdentifier,
                        status: "skipped"
                    })
                    continue
                }

                const ro = await createResearchObject(payloads.roPayload, auth)
                const annotation = payloads.annotationBody.length > 0
                    ? await addAnnotation(ro.identifier, payloads.annotationBody, auth)
                    : undefined

                await PbiSync.updateOne(
                    { ethnopediaArtworkId: payloads.ethnopediaArtworkId },
                    {
                        $set: {
                            ethnopediaArtworkId: payloads.ethnopediaArtworkId,
                            ethnopediaCollectionId: req.params.collectionId,
                            pbiRoIdentifier: ro.identifier,
                            pbiAnnotationIdentifier: annotation?.identifier,
                            payloadHash: payloads.payloadHash,
                            status: "synced",
                            lastError: undefined,
                            lastSyncedAt: new Date()
                        }
                    },
                    { upsert: true }
                ).exec()

                synced += 1
                items.push({
                    ethnopediaArtworkId: payloads.ethnopediaArtworkId,
                    pbiRoIdentifier: ro.identifier,
                    pbiAnnotationIdentifier: annotation?.identifier,
                    status: "synced"
                })
            } catch (syncError) {
                const err = syncError as Error
                failed += 1
                await PbiSync.updateOne(
                    { ethnopediaArtworkId: payloads.ethnopediaArtworkId },
                    {
                        $set: {
                            ethnopediaArtworkId: payloads.ethnopediaArtworkId,
                            ethnopediaCollectionId: req.params.collectionId,
                            payloadHash: payloads.payloadHash,
                            status: "failed",
                            lastError: err.message
                        }
                    },
                    { upsert: true }
                ).exec()
                items.push({
                    ethnopediaArtworkId: payloads.ethnopediaArtworkId,
                    status: "failed",
                    error: err.message
                })
            }
        }

        return res.status(200).json({
            collectionId: req.params.collectionId,
            total: artworks.length,
            synced,
            skipped,
            failed,
            items
        })
    } catch (error) {
        const err = error as Error
        console.error(error)
        if (err.message === "PBI authorization is missing") {
            return res.status(400).json({ error: err.message })
        }
        if (err.message === "Collection not found") {
            return res.status(404).json({ error: err.message })
        }
        return res.status(503).json({ error: "PBI synchronization failed" })
    }
})

export const getPbiSyncs = async (req: Request, res: Response) => {
    try {
        const filter = req.query.collectionId ? { ethnopediaCollectionId: req.query.collectionId } : {}
        const items = await PbiSync.find(filter).sort({ updatedAt: -1 }).limit(200).exec()
        return res.status(200).json({ items })
    } catch (error) {
        console.error(error)
        return res.status(503).json({ error: "Database unavailable" })
    }
}
