import axios from "axios"
import { API_URL } from "../config"

enum ExportExtent {
    all = "all",
    selected = "selected",
    searchResult = "searchResult"
}

export const getXlsxWithArtworksData = async (collectionName: string, keysToInclude: Array<string>, exportExtent: ExportExtent, selectedArtworksIds: { [key: string]: boolean }, searchParams: URLSearchParams, filename: string) => {
    const params = new URLSearchParams();
    keysToInclude.forEach((value, index) => { 
        params.append(`columnNames`, value); 
    });
    for(const v in selectedArtworksIds) {
        params.append(`selectedArtworks`, v);
    }
    params.append(`exportExtent`, exportExtent.toString())
    for(const [key, value] of searchParams.entries()) {
        params.append(key, value);
    }
    return await axios({
        url: `${API_URL}v1/dataExport/${collectionName}`,
        method: 'GET',
        responseType: 'blob',
        params: params
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

export const getXlsxWithCollectionData = async (collectionName: string) => {
    const params = new URLSearchParams();
    return await axios({
        url: `${API_URL}v1/dataExport/collection/${collectionName}`,
        method: 'GET',
        responseType: 'blob',
        params: params
    }).then((response) => {
        // create file link in browser's memory
        const href = URL.createObjectURL(response.data);
    
        // create "a" HTML element with href to file & click
        const link = document.createElement('a');
        link.href = href;
        link.setAttribute('download', `${collectionName}.xlsx`);
        document.body.appendChild(link);
        link.click();
    
        // clean up "a" element & remove ObjectURL
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    });
}