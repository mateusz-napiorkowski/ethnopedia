import { describe, expect, test } from "@jest/globals"
import { buildPbiPayloads, defaultPbiMapperConfig } from "../pbiPayloadBuilder"

describe("PBI payload builder", () => {
    const artwork: any = {
        _id: { toString: () => "68f0da123ef9466cb44dbb1a" },
        categories: [
            { name: "Incipit gwarowy", value: "Przybieżeli do Betlejem", subcategories: [] },
            { name: "Region", value: "Kaszuby", subcategories: [
                { name: "Miejscowość", value: "Bojano", subcategories: [] }
            ] }
        ]
    }

    test("builds research object and annotation payloads with mandatory Ethnopedia id", () => {
        const payloads = buildPbiPayloads(artwork, {
            ...defaultPbiMapperConfig,
            titlePath: "Incipit gwarowy",
            descriptionPath: "Region.Miejscowość",
            accessMode: "PUBLIC",
            researchAreas: ["Astronomy"],
            annotationMappings: [
                {
                    sourcePath: "Region.Miejscowość",
                    predicate: "http://purl.org/dc/terms/spatial",
                    valueMode: "literal"
                }
            ]
        }, "Kaszuby PPML")

        expect(payloads.ethnopediaArtworkId).toBe("68f0da123ef9466cb44dbb1a")
        expect(payloads.roPayload).toEqual({
            title: "Przybieżeli do Betlejem",
            description: "Bojano",
            access_mode: "PUBLIC",
            research_areas: ["Astronomy"]
        })
        expect(payloads.annotationBody).toEqual([
            {
                property: "http://purl.org/dc/terms/identifier",
                value: ["68f0da123ef9466cb44dbb1a"]
            },
            {
                property: "http://purl.org/dc/terms/spatial",
                value: "Bojano"
            }
        ])
    })

    test("uses stable fallbacks for missing title and description", () => {
        const payloads = buildPbiPayloads(artwork, {
            ...defaultPbiMapperConfig,
            titlePath: "Missing title",
            descriptionPath: "Missing description",
        }, "Kaszuby PPML")

        expect(payloads.roPayload.title).toBe("Ethnopedia record 68f0da123ef9466cb44dbb1a")
        expect(payloads.roPayload.description).toBe("Imported from Ethnopedia collection Kaszuby PPML")
    })
})
