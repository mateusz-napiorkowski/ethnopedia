export const collection = "example collection"
export const exampleArtworkId = "6752ddca46e3ca48231024dc"
export const collectionData = {
    "_id": "675ddf8c1e6d01766fbc5b2e",
    "name": collection,
    "description": "example collection description",
    "__v": 0
}

export const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXN"
    + "lcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaecc"
    + "N-rDSjRS3kApqlA"

export const loggedInUserContextProps = {
    isUserLoggedIn: true,
    firstName: "123",
    userId: "66b6506fbb64df165e8a9ce6",
    jwtToken: jwtToken,
    setUserData: jest.fn()
};
export const artworksData = {
    "artworks": [
        {
            "_id": exampleArtworkId,
            "categories": [
                {
                    "name": "Tytuł",
                    "values": [
                        "Jakym jechoł koło dworu"
                    ],
                    "subcategories": []
                },
                {
                    "name": "Artyści",
                    "values": [
                        "Józefa Piaskowska"
                    ],
                    "subcategories": []
                },
                {
                    "name": "Rok",
                    "values": [
                        "1960"
                    ],
                    "subcategories": []
                },
            ],
            "collectionName": collection,
            "__v": 0,
            "createdAt": "2024-12-06T11:19:38.327Z",
            "updatedAt": "2024-12-06T11:19:38.327Z"
        },
        {
            "_id": "6752ddca46e3ca48231024aa",
            "categories": [
                {
                    "name": "Tytuł",
                    "values": [
                        "Ojcze, ojcze, kup mi kónia"
                    ],
                    "subcategories": []
                },
                {
                    "name": "Artyści",
                    "values": [
                        "Magdalena Figlak"
                    ],
                    "subcategories": []
                },
                {
                    "name": "Rok",
                    "values": [
                        "1949"
                    ],
                    "subcategories": []
                },
            ],
            "collectionName": collection,
            "__v": 0,
            "createdAt": "2024-12-06T11:19:38.327Z",
            "updatedAt": "2024-12-06T11:19:38.327Z"
        },
        {
            "_id": "6752ddca46e3ca48231024bb",
            "categories": [
                {
                    "name": "Tytuł",
                    "values": [
                        "Piękna jagoda"
                    ],
                    "subcategories": []
                },
                {
                    "name": "Artyści",
                    "values": [
                        "Zespół Mazowsze"
                    ],
                    "subcategories": []
                },
                {
                    "name": "Rok",
                    "values": [
                        "2005"
                    ],
                    "subcategories": []
                },
            ],
            "collectionName": collection,
            "__v": 0,
            "createdAt": "2024-12-06T11:19:38.327Z",
            "updatedAt": "2024-12-06T11:19:38.327Z"
        },
    ],
    "total": 6,
    "currentPage": 1,
    "pageSize": 3
}

export const artworksDataSecondPage = {
    "artworks": [
        {
            "_id": "6752aaaa46e3ca48231024dc",
            "categories": [
                {
                    "name": "Tytuł",
                    "values": [
                        "W górach, nad rzeką"
                    ],
                    "subcategories": []
                },
                {
                    "name": "Artyści",
                    "values": [
                        "Józefa Piaskowska"
                    ],
                    "subcategories": []
                },
                {
                    "name": "Rok",
                    "values": [
                        "1960"
                    ],
                    "subcategories": []
                },
            ],
            "collectionName": collection,
            "__v": 0,
            "createdAt": "2024-12-06T11:19:38.327Z",
            "updatedAt": "2024-12-06T11:19:38.327Z"
        },
        {
            "_id": "6752aaaa46e5db48231024dc",
            "categories": [
                {
                    "name": "Tytuł",
                    "values": [
                        "Skrzypce na polu"
                    ],
                    "subcategories": []
                },
                {
                    "name": "Artyści",
                    "values": [
                        "Magdalena Figlak"
                    ],
                    "subcategories": []
                },
                {
                    "name": "Rok",
                    "values": [
                        "1949"
                    ],
                    "subcategories": []
                },
            ],
            "collectionName": collection,
            "__v": 0,
            "createdAt": "2024-12-06T11:19:38.327Z",
            "updatedAt": "2024-12-06T11:19:38.327Z"
        },
        {
            "_id": "1234aaca46e3ca48231024bb",
            "categories": [
                {
                    "name": "Tytuł",
                    "values": [
                        "Pragnom uoczka, pragnom"
                    ],
                    "subcategories": []
                },
                {
                    "name": "Artyści",
                    "values": [
                        "Zespół Mazowsze"
                    ],
                    "subcategories": []
                },
                {
                    "name": "Rok",
                    "values": [
                        "2005"
                    ],
                    "subcategories": []
                },
            ],
            "collectionName": collection,
            "__v": 0,
            "createdAt": "2024-12-06T11:19:38.327Z",
            "updatedAt": "2024-12-06T11:19:38.327Z"
        },
    ],
    "total": 6,
    "currentPage": 1,
    "pageSize": 3
}