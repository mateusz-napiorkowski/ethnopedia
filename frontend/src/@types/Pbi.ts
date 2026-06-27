export type PbiAccessMode = "PRIVATE" | "PUBLIC"
export type PbiValueMode = "literal" | "array" | "uri"
export type PbiEnrichmentMode = "none" | "files"

export interface PbiAnnotationMapping {
    sourcePath: string
    predicate: string
    valueMode: PbiValueMode
}

export interface PbiMapperConfig {
    titlePath: string
    descriptionPath?: string
    staticDescription?: string
    accessMode: PbiAccessMode
    researchAreas: string[]
    annotationMappings: PbiAnnotationMapping[]
    includeEthnopediaId: boolean
    enrichmentMode: PbiEnrichmentMode
}

export interface PbiCollectionPreview {
    collection: {
        id: string
        name: string
        description?: string
    }
    fields: string[]
    sampleArtworks: Array<{
        id: string
        flatCategories: Record<string, string>
    }>
}

export interface PbiSyncOptions {
    limit: number
    force: boolean
    onlyArtworkIds?: string[]
}

export interface PbiSyncItem {
    ethnopediaArtworkId: string
    pbiRoIdentifier?: string
    pbiAnnotationIdentifier?: string
    status: "synced" | "skipped" | "failed" | "pending"
    error?: string
    lastError?: string
    lastSyncedAt?: string
}

export interface PbiSyncResponse {
    collectionId: string
    total: number
    synced: number
    skipped: number
    failed: number
    items: PbiSyncItem[]
}

export interface PbiStatus {
    pbiApiBaseUrl: string
    keycloakIssuer: string
    pbiReachable: boolean
    authMode: string
    hasAuth: boolean
}
