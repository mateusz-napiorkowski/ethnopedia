import axios from "axios"
import { API_URL } from "../config"

enum ExportExtent {
    all = "all",
    selected = "selected",
    searchResult = "searchResult"
}

export const getXlsxWithArtworksData = async (collectionIds: Array<string>, keysToInclude: Array<string>, exportExtent: ExportExtent, selectedArtworksIds: { [key: string]: boolean }, searchParams: URLSearchParams, filename: string) => {
    return await axios({
        url: `${API_URL}v1/dataExport`,
        method: 'GET',
        responseType: 'blob',
        // params: params,
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
    const params = new URLSearchParams();
    return await axios({
        url: `${API_URL}v1/dataExport/collection/${collectionId}`,
        method: 'GET',
        responseType: 'blob',
        params: params
    }).then((response) => {
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