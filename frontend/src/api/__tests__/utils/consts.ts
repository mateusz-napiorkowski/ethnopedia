export const collectionName = "collection"
export const collectionDescription = "collection description"
export const collectionName2 = "collection 2"
export const collectionDescription2 = "collection description 2"

export const artworkId = "66ce0bf156199c1b8df5db7d"

export const collectionId = "66f2194a6123d7f50558cd8f"
export const collectionId2 = "66f2194a6123d7f50558cd7e"

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

export const registerUserFormData = {
    "username": "nowy",
    "firstName": "nowy",
    "password": "nowy"
}

export const loginUserFormData = {
    "username": "nowy",
    "password": "nowy"
}

export const registerUserReturnData = {
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImIiLCJmaXJzdE5hbWUiOiJiIiwidXNlcklkIjoiNjgzOThiYTE3MzdhZGU5ODEyZDEwYTc1IiwiaWF0IjoxNzQ4NjAxNzYxLCJleHAiOjE3NDk2MDE3NjF9.K8u4_WfhyqA13TjzKhQvjECl98zx94lZolhKPFjRxnY"
    },
    "status": 201,
    "statusText": "Created",
    "headers": {
        "content-length": "229",
        "content-type": "application/json; charset=utf-8"
    },
    "config": {
        "transitional": {
            "silentJSONParsing": true,
            "forcedJSONParsing": true,
            "clarifyTimeoutError": false
        },
        "adapter": [
            "xhr",
            "http"
        ],
        "transformRequest": [
            null
        ],
        "transformResponse": [
            null
        ],
        "timeout": 0,
        "xsrfCookieName": "XSRF-TOKEN",
        "xsrfHeaderName": "X-XSRF-TOKEN",
        "maxContentLength": -1,
        "maxBodyLength": -1,
        "env": {},
        "headers": {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json"
        },
        "method": "post",
        "url": "http://localhost:8080/api/v1/auth/register",
        "data": "{\"username\":\"nowy\",\"firstName\":\"nowy\",\"password\":\"nowy\"}"
    },
    "request": {}
}

export const loginUserReturnData = {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXNlcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzQ4ODcxMDY4LCJleHAiOjE3NDk4NzEwNjh9.FJnjP7XQ8hpPgyXcQejbjiwXe8pX7mzVuS1diFwXw_w"
}

export const useLoginMutationReturnValue = {
    "error": null,
    "failureCount": 0,
    "isPaused": false,
    "status": "loading",
    "variables": {
        "username": "a",
        "password": "a"
    },
    "isLoading": true,
    "isSuccess": false,
    "isError": false,
    "isIdle": false
}

export const userId = '66d71fd54c148fb8f827c2c3'

export const deleteAccountReturnValue = {
    "_id": userId,
    "username": "nowy",
    "password": "$2b$10$bqra7NvKvlAQ45R2rnIC0uFXrqgJCfmUhQ88p0UOK.FTVCshqUkXi",
    "firstName": "nowy",
    "accountCreationDate": "2025-05-30T10:42:41.903Z",
    "__v": 0
}

export const getAllCategoriesMockReturnValue = [
    "Tytuł",
    "Artyści",
    "Rok"
]

export const getAllCollectionsMockReturnValue = {
    "collections": [
        {
            "id": collectionId,
            "name": collectionName,
            "description": collectionDescription,
            "artworksCount": 3
        },
        {
            "id": collectionId2,
            "name": collectionName2,
            "description": collectionDescription2,
            "artworksCount": 0
        },
    ],
    "total": 2,
    "currentPage": 1,
    "pageSize": 10
}

export const getCollectionMockReturnValue = {
    "_id": collectionId,
    "name": collectionName,
    "description": collectionDescription,
    "categories": [
        {
            "name": "Tytuł",
            "subcategories": []
        },
    ],
    "__v": 0
}

export const collectionCategories = [
    {
        "name": "Tytuł",
        "subcategories": []
    }
]

export const createCollectionMockReturnValue = [
    {
        "name": collectionName,
        "description": collectionDescription,
        "categories": collectionCategories,
        "_id": collectionId,
        "__v": 0
    }
]

export const updateCollectionMockReturnValue = {
    "_id": collectionId,
    "name": collectionName,
    "description": collectionDescription,
    "categories": collectionCategories,
    "__v": 1
}

export const deleteCollectionsMockReturnValue = {
    "deletedCount": 2,
    "deletedArtworksCount": 1
}

export const dataToImport = [
    [
        "Tytuł",
        "Artyści",
        "Rok"
    ],
    [
        "Nowy tytuł",
        "Jan Kowalski",
        "1410"
    ],
    [
        "Nowy tytuł 2",
        "Anna Nowak",
        "1410",
    ]
]

export const importDataMockReturnValue = [
    {
        "collectionName": collectionName,
        "categories": [
            {
                "name": "Tytuł",
                "value": "Nowy tytuł",
                "subcategories": []
            },
            {
                "name": "Artyści",
                "value": "Jan Kowalski",
                "subcategories": []
            },
            {
                "name": "Rok",
                "value": "1410",
                "subcategories": []
            }
        ],
        "_id": "683d95ca14504f56670e5445",
        "__v": 0,
        "createdAt": "2025-06-02T12:15:06.048Z",
        "updatedAt": "2025-06-02T12:15:06.048Z"
    },
    {
        "collectionName": collectionName,
        "categories": [
            {
                "name": "Tytuł",
                "value": "Nowy tytuł 2",
                "subcategories": []
            },
            {
                "name": "Artyści",
                "value": "Anna Nowak",
                "subcategories": []
            },
            {
                "name": "Rok",
                "value": "1410",
                "subcategories": []
            }
        ],
        "_id": "683d95ca14504f56670e5446",
        "__v": 0,
        "createdAt": "2025-06-02T12:15:06.048Z",
        "updatedAt": "2025-06-02T12:15:06.048Z"
    }
]

export const importDataAsCollectionMockReturnData = {
    "newCollection": [
        {
            "name": collectionName,
            "description": collectionDescription,
            "categories": [
                {
                    "name": "Tytuł",
                    "subcategories": []
                },
                {
                    "name": "Artyści",
                    "subcategories": []
                },
                {
                    "name": "Rok",
                    "subcategories": []
                }
            ],
            "_id": "683d96ef14504f56670e545d",
            "__v": 0
        }
    ],
    "result": [
        {
            "collectionName": collectionName,
            "categories": [
                {
                    "name": "Tytuł",
                    "value": "Nowy tytuł",
                    "subcategories": []
                },
                {
                    "name": "Artyści",
                    "value": "Jan Kowalski",
                    "subcategories": []
                },
                {
                    "name": "Rok",
                    "value": "1410",
                    "subcategories": []
                }
            ],
            "_id": "683d96ef14504f56670e545f",
            "__v": 0,
            "createdAt": "2025-06-02T12:19:59.995Z",
            "updatedAt": "2025-06-02T12:19:59.995Z"
        },
        {
            "collectionName": collectionName,
            "categories": [
                {
                    "name": "Tytuł",
                    "value": "Nowy tytuł 2",
                    "subcategories": []
                },
                {
                    "name": "Artyści",
                    "value": "Anna Nowak",
                    "subcategories": []
                },
                {
                    "name": "Rok",
                    "value": "1410",
                    "subcategories": []
                }
            ],
            "_id": "683d96ef14504f56670e5460",
            "__v": 0,
            "createdAt": "2025-06-02T12:19:59.995Z",
            "updatedAt": "2025-06-02T12:19:59.995Z"
        }
    ]
}