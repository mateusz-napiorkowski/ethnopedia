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
    researchAreas: [process.env.PBI_DEFAULT_RESEARCH_AREA || "Astronomy"],
    annotationMappings: [],
    includeEthnopediaId: true,
    enrichmentMode: "none"
}

const normalizeResearchAreas = (researchAreas: string[] | undefined) => {
    const areas = (researchAreas || [])
        .map(area => area.trim())
        .filter(area => area.length > 0)
    return areas.length > 0 ? areas : [process.env.PBI_DEFAULT_RESEARCH_AREA || "Astronomy"]
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
    const titleFallback = `Ethnopedia record ${ethnopediaArtworkId}`
    const descriptionFallback = mapperConfig.staticDescription?.trim()
        || `Imported from Ethnopedia collection ${collectionName}`

    const title = getMappedValue(flatCategories, mapperConfig.titlePath, titleFallback)
    const description = mapperConfig.staticDescription?.trim()
        || getMappedValue(flatCategories, mapperConfig.descriptionPath, descriptionFallback)

    const annotationBody: PbiAnnotationBodyItem[] = []
    if (mapperConfig.includeEthnopediaId !== false) {
        annotationBody.push({
            property: DCTERMS_IDENTIFIER,
            value: [ethnopediaArtworkId]
        })
    }

    for (const mapping of mapperConfig.annotationMappings || []) {
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
