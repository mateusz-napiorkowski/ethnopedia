import { artworkCategory } from "./interfaces"

export type FlatArtworkCategories = Record<string, string>

const flattenCategory = (
    category: artworkCategory,
    prefix: string,
    result: FlatArtworkCategories
) => {
    const path = prefix ? `${prefix}.${category.name}` : category.name
    result[path] = category.value ?? ""
    for (const subcategory of category.subcategories ?? []) {
        flattenCategory(subcategory, path, result)
    }
}

export const flattenArtworkCategories = (categories: artworkCategory[] = []): FlatArtworkCategories => {
    const result: FlatArtworkCategories = {}
    for (const category of categories) {
        flattenCategory(category, "", result)
    }
    return result
}

export const getMappedValue = (
    flatCategories: FlatArtworkCategories,
    sourcePath: string | undefined,
    fallback = ""
): string => {
    if (!sourcePath) {
        return fallback
    }
    const value = flatCategories[sourcePath]
    if (value === undefined || value === null || value.toString().trim() === "") {
        return fallback
    }
    return value.toString()
}
