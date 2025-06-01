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
    return axios.get(`${API_URL}v1/collection`, {
        params: {
            page: page,
            pageSize: pageSize,
            sortOrder: 'asc'
        },
    }).then(res => res.data)
}

export const getCollection = async (id: string) => {
    return await axios.get(`${API_URL}v1/collection/${id}`, {headers: {
        'Content-Type': 'application/json; charset=UTF-8'
    }}).then(res => res.data)
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
    return await axios.put(
        `${API_URL}v1/collection/edit/${id}`,
        { name, description, categories },
        { headers: { Authorization: `Bearer ${jwtToken}` } }
    ).then(res => res.data)
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