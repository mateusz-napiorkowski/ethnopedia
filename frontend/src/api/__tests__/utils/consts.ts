const collectionName = "collection"
export const artworkId = "66ce0bf156199c1b8df5db7d"
export const collectionId = "66f2194a6123d7f50558cd8f"
export const axiosError = {
    "message": "Network Error",
    "name": "AxiosError",   
}
export const getArtworkMockReturnValue = { 
    artwork: {
        _id: artworkId,
        createdAt: '2024-10-22T20:12:12.209Z',
        updatedAt: '2024-10-22T20:12:12.209Z',
        __v: 0,
        categories: [
            {
                name: 'Tytuł',
                value: 'testowy',
                subcategories: []
            },
        ],
        collectionName: collectionName
    },
};
export const getArtworkForPageMockReturnValue = {
    "artworks": [
        {
            "__v": 0,
            "_id": "66ce0bf156199c1b8df5db7d",
            "categories": [
                {
                "name": "Tytuł",
                "subcategories": [],
                "value": "testowy",
                },
            ],
            "collectionName": collectionName,
            "createdAt": "2024-10-22T20:12:12.209Z",
            "updatedAt": "2024-10-22T20:12:12.209Z",
        },
    ],
    "currentPage": 1,
    "pageSize": 10,
    "total": 1,
}