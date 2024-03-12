import axios from "axios"
import { API_URL } from "../config"
import { useMutation } from "react-query"

export const getXlsxWithAllData = async (collectionName: string, keysToInclude: Array<string>, selectedArtworksIds: { [key: string]: boolean }, exportSelectedRecords: boolean, filename: string) => {
    const params = new URLSearchParams(); 
    keysToInclude.forEach((value, index) => { 
        params.append(`keysToInclude[${index}]`, value); 
    });
    for(const v in selectedArtworksIds) {
        params.append(`selectedArtworks[${v}]`, v);
    }
    params.append(`exportSelectedRecords`, exportSelectedRecords.toString())
    params.append(`exportFilename`, filename)
    return await axios({
        url: `${API_URL}v1/xlsx/${collectionName}`,
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

export const getAllKeys = async (collectionName: string) => {
    return await axios.get(`${API_URL}v1/xlsx/keys/${collectionName}`)
        .then(res => res.data)
}