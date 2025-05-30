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

export const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXN"
    + "lcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaecc"
    + "N-rDSjRS3kApqlA"

export const artworkPayload = {
    "categories": [
        {
            "name": "Tytuł",
            "value": "testowy",
            "subcategories": []
        },
    ],
    "collectionName": collectionName
}

export const createArtworkMockReturnValue = {
    ...artworkPayload,
    "_id": "6839828f96472c0836a60c7f",
    "createdAt": "2025-05-30T10:03:59.103Z",
    "updatedAt": "2025-05-30T10:03:59.103Z",
    "__v": 0
}

export const editArtworkReturnValue = {
  acknowledged: true,
  modifiedCount: 1,
  upsertedId: null,
  upsertedCount: 0,
  matchedCount: 1
}

export const deleteArtworksReturnValue = {
    "acknowledged": true,
    "deletedCount": 1
}