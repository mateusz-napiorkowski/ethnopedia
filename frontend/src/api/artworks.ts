import axios from "axios"
import { API_URL } from "../config"
import { useMutation } from "react-query"

export const getArtworks = async () => {
    const response = await axios.get(`${API_URL}v1/artworks`)
    return response.data
}

export const getArtwork = async (id: string) => {
    return await axios.get(`${API_URL}v1/artworks/${id}`)
        .then(res => res.data)
}

export const getAdvancedSearchResult = async (queryParameters: string) => {
    return await axios.get(`${API_URL}v1${queryParameters}`)
        .then(res => res.data)
}

export const getArtworksByCategory = async (collection: string, page: number, pageSize: number, searchText: string | null) => {
    return await axios.get(`${API_URL}v1/collection/${collection}/artworks`, {
        params: {
            page: page,
            pageSize: pageSize,
            searchText: searchText
        },
    })
        .then(res => res.data)
}


export const createArtwork = async (artworkData: any) => {
    console.log("frontend");
    console.log("dane:", artworkData);
    return await axios
        .post(`${API_URL}v1/artworks/create`, artworkData)
        .then(res => res.data)
}

export const updateArtwork = async ({ id, artwork, jwtToken }: {
    id: string
    artwork: any
    jwtToken: string
}) => {
    const response = await axios.put(`${API_URL}v1/artworks/${id}`, artwork, { headers: { "Authorization": `Bearer ${jwtToken}` } })
    return response.data
}

export const useBatchDeleteArtworkMutation = () => {
    return useMutation(async (artworks: string[]) => {
        const artworkIds = artworks.join(",")
        const url = `${API_URL}v1/artworks/${artworkIds}`

        const res = await axios.delete(url)
        return res.data
    })
}

export const deleteArtwork = async (artworkId: string, jwtToken: string) => {
    const response = await axios.delete(`${API_URL}v1/artworks/${artworkId}`, { headers: { "Authorization": `Bearer ${jwtToken}` } })
    return response.data
}