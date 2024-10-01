import axios from "axios"
import { API_URL } from "../config"

export const getXlsxWithArtworksData = async (collectionName: string, keysToInclude: Array<string>, selectedArtworksIds: { [key: string]: boolean }, exportSelectedRecords: boolean, filename: string) => {
    const params = new URLSearchParams();
    keysToInclude.forEach((value, index) => { 
        params.append(`columnNames`, value); 
    });
    for(const v in selectedArtworksIds) {
        params.append(`selectedArtworks`, v);
    }
    params.append(`exportSelectedRecords`, exportSelectedRecords.toString())
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