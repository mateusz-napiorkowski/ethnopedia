import crypto from "crypto"
import { flattenArtworkCategories, getMappedValue, FlatArtworkCategories } from "../utils/pbi-mapper"

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

export interface PbiRoPayload {
    title: string
    description: string
    access_mode: PbiAccessMode
    research_areas: string[]
}

export interface PbiAnnotationBodyItem {
    property: string
    value: string | string[]
}

export interface BuiltPbiPayloads {
    ethnopediaArtworkId: string
    flatCategories: FlatArtworkCategories
    roPayload: PbiRoPayload
    annotationBody: PbiAnnotationBodyItem[]
    payloadHash: string
}

export const DCTERMS_IDENTIFIER = "http://purl.org/dc/terms/identifier"

export const defaultPbiMapperConfig: PbiMapperConfig = {
    titlePath: "",
    accessMode: "PUBLIC",
    researchAreas: process.env.PBI_DEFAULT_RESEARCH_AREA ? [process.env.PBI_DEFAULT_RESEARCH_AREA] : [],
    annotationMappings: [],
    includeEthnopediaId: true,
    enrichmentMode: "none"
}

const normalizeResearchAreas = (researchAreas: string[] | undefined) => {
    const areas = (researchAreas || [])
        .map(area => area.trim())
        .filter(area => area.length > 0)
    if (areas.length > 0) {
        return areas
    }
    return process.env.PBI_DEFAULT_RESEARCH_AREA ? [process.env.PBI_DEFAULT_RESEARCH_AREA] : []
}

const valueForMode = (value: string, mode: PbiValueMode): string | string[] => {
    if (mode === "array") {
        return [value]
    }
    return value
}

export const buildPbiPayloads = (
    artwork: any,
    mapperConfig: PbiMapperConfig,
    collectionName: string
): BuiltPbiPayloads => {
    const ethnopediaArtworkId = artwork._id.toString()
    const flatCategories = flattenArtworkCategories(artwork.categories || [])
    const autoTitleFallback = (() => {
        // Prefer a human-readable top-level field (e.g. "Incipit gwarowy",
        // "Tytuł") over the raw Mongo id so objects are distinguishable in PBI.
        const preferredFields = ["Tytuł", "Incipit gwarowy", "Incipit literacki", "Tytuł utworu", "Numer w publikacji"]
        for (const field of preferredFields) {
            const value = flatCategories[field]
            if (value && value.toString().trim() !== "") {
                return `${collectionName} – ${value.toString().trim()}`
            }
        }
        const firstNonEmpty = Object.entries(flatCategories).find(([, v]) => v && v.toString().trim() !== "")
        if (firstNonEmpty) {
            return `${collectionName} – ${firstNonEmpty[1].toString().trim()}`
        }
        return `Ethnopedia record ${ethnopediaArtworkId}`
    })()
    const descriptionFallback = mapperConfig.staticDescription?.trim()
        || `Imported from Ethnopedia collection ${collectionName}`

    const title = getMappedValue(flatCategories, mapperConfig.titlePath, autoTitleFallback)
    const description = mapperConfig.staticDescription?.trim()
        || getMappedValue(flatCategories, mapperConfig.descriptionPath, descriptionFallback)

    const annotationBody: PbiAnnotationBodyItem[] = []
    if (mapperConfig.includeEthnopediaId !== false) {
        annotationBody.push({
            property: DCTERMS_IDENTIFIER,
            value: [ethnopediaArtworkId]
        })
    }

    const explicitMappings = mapperConfig.annotationMappings || []
    if (explicitMappings.length > 0) {
        for (const mapping of explicitMappings) {
            if (!mapping.sourcePath || !mapping.predicate) {
                continue
            }
            const value = getMappedValue(flatCategories, mapping.sourcePath)
            if (!value) {
                continue
            }
            annotationBody.push({
                property: mapping.predicate,
                value: valueForMode(value, mapping.valueMode)
            })
        }
    } else {
        // No explicit field mapping provided: auto-map every non-empty
        // Ethnopedia category field to an RDF triple instead of silently
        // dropping all metadata (only the Ethnopedia id would otherwise be synced).
        for (const [fieldPath, value] of Object.entries(flatCategories)) {
            if (value === undefined || value === null || value.toString().trim() === "") {
                continue
            }
            const slug = fieldPath
                .normalize("NFKD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-zA-Z0-9]+/g, "_")
                .replace(/^_+|_+$/g, "")
            annotationBody.push({
                property: `https://ethnopedia.ckc.uw.edu.pl/vocab/${slug}`,
                value: value.toString()
            })
        }
    }

    const roPayload: PbiRoPayload = {
        title,
        description,
        access_mode: mapperConfig.accessMode || "PUBLIC",
        research_areas: normalizeResearchAreas(mapperConfig.researchAreas)
    }

    const payloadHash = crypto
        .createHash("sha256")
        .update(JSON.stringify({ roPayload, annotationBody }))
        .digest("hex")

    return {
        ethnopediaArtworkId,
        flatCategories,
        roPayload,
        annotationBody,
        payloadHash
    }
}
