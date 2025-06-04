import axios from "axios"
import { API_URL } from "../config"
import {ExportExtent} from "../@types/DataExport"

export const getXlsxWithArtworksData = async (collectionIds: Array<string>, keysToInclude: Array<string>, exportExtent: ExportExtent, selectedArtworksIds: { [key: string]: boolean }, searchParams: URLSearchParams, filename: string) => {
    return await axios.get(`${API_URL}v1/dataExport`, {
        responseType: 'blob',
        params: {
            columnNames: keysToInclude,
            selectedArtworks: Object.keys(selectedArtworksIds),
            exportExtent: exportExtent.toString(),
            collectionIds: collectionIds,
            ...Object.fromEntries(searchParams.entries())
        }
    }).then((response) => {
        // create file link in browser's memory
        const href = URL.createObjectURL(response.data);
    
        // create "a" HTML element with href to file & click
        const link = document.createElement('a');
        link.href = href;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
    
        // clean up "a" element & remove ObjectURL
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    });
}

export const getXlsxWithCollectionData = async (collectionId: string | undefined) => {
    return await axios.get(
        `${API_URL}v1/dataExport/collection/${collectionId}`,
        { responseType: 'blob' }
    ).then((response) => {
        // create file link in browser's memory
        const href = URL.createObjectURL(response.data);
    
        // create "a" HTML element with href to file & click
        const link = document.createElement('a');
        link.href = href;
        link.setAttribute('download', `${collectionId}.xlsx`);
        document.body.appendChild(link);
        link.click();
    
        // clean up "a" element & remove ObjectURL
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    });
}