import axios from "axios"
import { Collection } from "../@types/Collection"
import { useMutation } from "react-query"
import { API_URL } from "../config"
import {SelectedDetail} from "../components/artwork/types/ArtworkTypes";

interface CollectionsResponse {
    collections: Collection[];
    total: number;
    currentPage: number;
    pageSize: number;
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

export const addNewCollection = async (name: any, description: any, jwtToken: any) => {
    const config = {
        headers: { Authorization: `Bearer ${jwtToken}` }
    };
    return await axios
        .post(`${API_URL}v1/collection/add`, {name, description}, config)
        .then(res => res.data)
}

export const useBatchDeleteCollectionMutation = () => {
    return useMutation(async (data: Array<any>) => {
        const collectionIds = data[0].join(",")
        const url = `${API_URL}v1/collection/${collectionIds}`
        const config = {
            headers: { Authorization: `Bearer ${data[1]}` }
        };
        const res = await axios.delete(url, config)
        return res.data
    })
}

export const getSingleCollection = async (id: string) => {
    const response = await axios.get(`${API_URL}v1/collection/${id}`)
    return response.data as Collection
}
