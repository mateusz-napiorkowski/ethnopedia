import axios from "axios"
import { API_URL } from "../config"

export const getArtwork = async (id: string) => {
    return await axios.get(`${API_URL}v1/artworks/${id}`)
        .then(res => res.data)
}

export const getArtworksForCollectionPage = async (collection: string, page: number, pageSize: number, sortOrder: string, searchText: string | null, queryParams: any) => {
    return await axios.get(`${API_URL}v1/artworks/${collection}/artworks/${sortOrder}`, {
        params: {
            page: page,
            pageSize: pageSize,
            searchText: searchText,
            search: Object.entries(queryParams).length !== 0 ? true : false,
            ...queryParams
        }
    })
        .then(res => res.data)
}

export const createArtwork = async (artworkData: any, jwtToken: any) => {
    const config = {
        headers: { Authorization: `Bearer ${jwtToken}` }
    };
    return await axios
        .post(`${API_URL}v1/artworks/create`, artworkData, config)
        .then(res => res.data)
}

export const editArtwork = async (artworkData: any, artworkId: string, jwtToken: any) => {
    const config = {
        headers: { Authorization: `Bearer ${jwtToken}` }
    };
    return await axios
        .put(`${API_URL}v1/artworks/edit/${artworkId}`, artworkData, config)
        .then(res => res.data)
}

export const deleteArtworks = async (artworkIds: Array<string>, jwtToken: string) => {
    const config = {
        headers: { "Authorization": `Bearer ${jwtToken}` },
        data: { ids: artworkIds}
    };
    return await axios
        .delete(`${API_URL}v1/artworks/delete`, config)
        .then(res => res.data)
}






