import axios from "axios"
import { API_URL } from "../config"
import {ExportExtent} from "../@types/DataExport"

export const getXlsxWithArtworksData = async (
    collectionIds: Array<string>,
    keysToInclude: Array<string>,
    exportExtent: ExportExtent,
    selectedArtworksIds: { [key: string]: boolean },
    searchParams: URLSearchParams,
    filename: string,
    includeIds: boolean,
    includeFilenames: boolean,
    exportAsCSV: boolean
) => {
    return await axios.get(`${API_URL}v1/dataExport`, {
        responseType: 'blob',
        params: {
            columnNames: keysToInclude,
            selectedArtworks: Object.keys(selectedArtworksIds),
            exportExtent: exportExtent.toString(),
            collectionIds: collectionIds,
            searchParams,
            includeIds,
            includeFilenames,
            exportAsCSV
        }
    }).then((response) => {
        // create file link in browser's memory
        const href = URL.createObjectURL(response.data);
    
        // create "a" HTML element with href to file & click
        const link = document.createElement('a');
        link.href = href;
        link.setAttribute('download', exportAsCSV ? `${filename}.csv` : `${filename}.xlsx`);
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

export const getArtworksFilesArchive = async (collectionIds: Array<string>, exportExtent: ExportExtent, selectedArtworksIds: { [key: string]: boolean }, searchParams: URLSearchParams, archiveFilename: string) => {
    return await axios.get(`${API_URL}v1/dataExport/files`, {
        responseType: 'blob',
        params: {
            selectedArtworks: Object.keys(selectedArtworksIds),
            exportExtent: exportExtent.toString(),
            collectionIds: collectionIds,
            searchParams
        }
    }).then((response) => {
        // create file link in browser's memory
        const href = URL.createObjectURL(response.data);
    
        // create "a" HTML element with href to file & click
        const link = document.createElement('a');
        link.href = href;
        link.setAttribute('download', `${archiveFilename}.zip`);
        document.body.appendChild(link);
        link.click();
    
        // clean up "a" element & remove ObjectURL
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    });
}