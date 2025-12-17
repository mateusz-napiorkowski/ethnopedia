import { Category } from "./Category"

export type Collection = {
    id?: string
    description: string
    name: string
    categories?: Category[];
    artworksCount?: number
    categoriesCount?: number
    isPrivate: boolean
}
