import axios from "axios"
import { Collection } from "../@types/Collection"
import { useMutation } from "react-query"
import { API_URL } from "../config"
import { Category } from "../@types/Category"

interface CollectionsResponse {
    collections: Collection[];
    total: number;
    currentPage: number;
    pageSize: number;
}

export const getAllCollections = async (page: number = 1, pageSize: number = 10): Promise<CollectionsResponse> => {
    const response = await axios.get(`${API_URL}v1/collection`, {
        params: {
            page: page,
            pageSize: pageSize,
            sortOrder: 'asc'
        },
    })
    return response.data as CollectionsResponse
}

export const getCollection = async (id: string) => {
    const response = await axios.get(`${API_URL}v1/collection/${id}`, {headers: {
        'Content-Type': 'application/json; charset=UTF-8'
    }})
    return response.data
}


export const createCollection = async (name: any, description: any, categories: Category[], jwtToken: any) => {
    const config = {
        headers: { Authorization: `Bearer ${jwtToken}` }
    };
    return await axios
        .post(`${API_URL}v1/collection/create`, {name, description, categories}, config)
        .then(res => res.data)
}

export const updateCollection = async (
    id: string,
    name: string,
    description: string,
    categories: Category[],
    jwtToken: string
) => {
    console.log("Frontend API: id:", id, "name:", name, description, categories);
    console.log("Type of collectionId:", typeof id);
    const config = {
        headers: { Authorization: `Bearer ${jwtToken}` },
    };
    const res = await axios.put(
        `${API_URL}v1/collection/edit/${id}`,
        { name, description, categories },
        config
    );
    return res.data;
};

export const useBatchDeleteCollectionMutation = () => {
    return useMutation(async (data: Array<any>) => {
        const url = `${API_URL}v1/collection/delete`
        const config = {
            headers: { Authorization: `Bearer ${data[1]}` },
            data: { ids: data[0]}
        };
        const res = await axios.delete(url, config)
        return res.data
    })
}