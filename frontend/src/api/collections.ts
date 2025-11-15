import axios from "axios"
import { Collection } from "../@types/Collection"
import { API_URL } from "../config"
import { Category } from "../@types/Category"

interface CollectionsResponse {
    collections: Collection[];
    total: number;
    currentPage: number;
    pageSize: number;
}

export const getAllCollections = async (page: number = 1, pageSize: number = 10, sortOrder: string, jwtToken: string | undefined = undefined): Promise<CollectionsResponse> => {  
    return axios
        .get(`${API_URL}v1/collection`, {
            params: {
                page: page,
                pageSize: pageSize,
                sortOrder: sortOrder
            },
            headers: jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}
        })
        .then(res => res.data);
}

export const getCollection = async (id: string) => {
    return await axios
        .get(
            `${API_URL}v1/collection/${id}`,
            {headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            }}
        )
        .then(res => res.data);
};


export const createCollection = async (name: string, description: string, categories: Category[], jwtToken: string, isCollectionPrivate: boolean) => {
    const config = {
        headers: { Authorization: `Bearer ${jwtToken}` }
    };

    return await axios
        .post(`${API_URL}v1/collection/create`, {name, description, categories, isCollectionPrivate}, config)
        .then(res => res.data);
};

export const updateCollection = async (
    id: string,
    name: string,
    description: string,
    categories: Category[],
    jwtToken: string
) => {
    return await axios
        .put(
            `${API_URL}v1/collection/edit/${id}`,
            { name, description, categories },
            { headers: { Authorization: `Bearer ${jwtToken}` } }
        )
        .then(res => res.data);
};

export const deleteCollections = async (collectionIds: Array<string>, jwtToken: string) => {
    return await axios.delete(
        `${API_URL}v1/collection/delete`,
        {
            headers: { Authorization: `Bearer ${jwtToken}` },
            data: { ids: collectionIds}
        }
    ).then(res => res.data);
};