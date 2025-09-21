import axios from "axios";
import { API_URL } from "../config";
import { Metadata } from "../@types/Metadata";
import { UploadedFileData } from "../@types/Files";

export const getArtwork = async (id: string) => {
    return await axios
        .get(`${API_URL}v1/artworks/${id}`)
        .then(res => res.data);
};

export const getArtworksForPage = async (
    collectionIds: string[],
    page: number,
    pageSize: number,
    sortBy: string,
    sortOrder: string,
    searchText: string | null,
    searchRules: Record<string, any>,
) => {
    return await axios
        .get(`${API_URL}v1/artworks/`, {
            params: {
                page: page,
                pageSize: pageSize,
                searchText: searchText,
                sortBy: sortBy,
                sortOrder: sortOrder,
                search: Object.entries(searchRules).length !== 0 || searchText ? true : false,
                collectionIds: collectionIds,
                ...searchRules,
            },
        })
        .then(res => res.data);
};

export const createArtwork = async (
    collectionId: string,
    categories: Metadata[],
    files: File[],
    jwtToken: string
) => {
    const formData = new FormData();
    for(const file of files)
        formData.append("files", file);
    formData.append("categories", JSON.stringify(categories));
    formData.append("collectionId", collectionId);

    const config = {
        headers: { Authorization: `Bearer ${jwtToken}` }
    };

    return await axios
        .post(`${API_URL}v1/artworks/create`, formData, config)
        .then(res => res.data);
}

export const editArtwork = async (
    artworkId: string,
    collectionId: string,
    categories: Metadata[],
    filesToUpload: File[],
    filesToDelete: UploadedFileData[],
    jwtToken: string
) => {
    const formData = new FormData();
    formData.append("collectionId", collectionId);
    formData.append("categories", JSON.stringify(categories));
    for(const file of filesToUpload)
        formData.append("files", file);
    formData.append("filesToDelete", JSON.stringify(filesToDelete));

    const config = {
        headers: {
            Authorization: `Bearer ${jwtToken}`,
        },
    };

    return await axios
        .put(`${API_URL}v1/artworks/edit/${artworkId}`, formData, config)
        .then(res => res.data);
};

export const deleteArtworks = async (
    artworkIds: Array<string>,
    jwtToken: string
) => {
    const config = {
        headers: { "Authorization": `Bearer ${jwtToken}` },
        data: { ids: artworkIds}
    };

    return await axios
        .delete(`${API_URL}v1/artworks/delete`, config)
        .then(res => res.data);
};