import axios from "axios"
import { Collection } from "../@types/Collection"
import { useMutation } from "react-query"
import { API_URL } from "../config"

interface CollectionsResponse {
    collections: Collection[];
    total: number;
    currentPage: number;
    pageSize: number;
}


type Subcategory = {
    name: string
    values?: string[]
    subcategories?: Subcategory[]
    isSelectable?: boolean
}

interface SelectedDetail {
    category: any;
    subcategories: Subcategory[];
    values?: string[]
}


export const getCollections = async (page: number = 1, pageSize: number = 10): Promise<CollectionsResponse> => {
    const response = await axios.get(`${API_URL}v1/collection`, {
        params: {
            page: page,
            pageSize: pageSize,
        },
    })
    return response.data as CollectionsResponse
}

export const useCreateCollectionMutation = () => {
    return useMutation(async (newCollectionData: Collection) => {
        const res = await axios.post(`${API_URL}v1/collection`, newCollectionData)
        return res.data
    })
}

export const useCreateRecordMutation = (jwtToken: string) => {
    return useMutation(async (details: SelectedDetail[]) => {
        const res = await axios.post(`${API_URL}v1/artworks`, details, {
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
        })
        return res.data
    })
}
export const useBatchDeleteCollectionMutation = () => {
    return useMutation(async (collections: string[]) => {
        const collectionIds = collections.join(",")
        const url = `${API_URL}v1/collection/${collectionIds}`

        const res = await axios.delete(url)
        return res.data
    })
}

export const updateCollection = async ({
                                           id,
                                           collectionData,
                                           jwtToken,
                                       }: {
    id: string;
    collectionData: Collection;
    jwtToken: string;
}) => {
    const response = await axios.patch(`${API_URL}v1/collection/${id}`, collectionData, {
        headers: { "Authorization": `Bearer ${jwtToken}` },
    })
    return response.data
}

export const getSingleCollection = async (id: string) => {
    const response = await axios.get(`${API_URL}v1/collection/${id}`)
    return response.data as Collection
}
