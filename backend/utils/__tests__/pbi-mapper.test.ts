import { describe, expect, test } from "@jest/globals"
import { flattenArtworkCategories, getMappedValue } from "../pbi-mapper"

describe("PBI mapper utilities", () => {
    test("flattens nested artwork categories using dotted paths", () => {
        const categories = [
            {
                name: "Region",
                value: "Kaszuby",
                subcategories: [
                    {
                        name: "Powiat",
                        value: "Wejherowo",
                        subcategories: [
                            { name: "Miejscowość", value: "Bojano", subcategories: [] }
                        ]
                    }
                ]
            },
            { name: "Numer w publikacji", value: "K0020a", subcategories: [] }
        ]

        expect(flattenArtworkCategories(categories)).toEqual({
            "Region": "Kaszuby",
            "Region.Powiat": "Wejherowo",
            "Region.Powiat.Miejscowość": "Bojano",
            "Numer w publikacji": "K0020a"
        })
    })

    test("returns a fallback when requested mapped value is missing or empty", () => {
        const flatCategories = {
            "Incipit": "",
            "Region": "Kaszuby"
        }

        expect(getMappedValue(flatCategories, "Region", "fallback")).toBe("Kaszuby")
        expect(getMappedValue(flatCategories, "Incipit", "fallback")).toBe("fallback")
        expect(getMappedValue(flatCategories, "Missing", "fallback")).toBe("fallback")
        expect(getMappedValue(flatCategories, undefined, "fallback")).toBe("fallback")
    })
})
