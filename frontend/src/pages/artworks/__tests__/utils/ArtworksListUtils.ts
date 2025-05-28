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

export const collectionData = {
    "_id": "675ddf8c1e6d01766fbc5b2e",
    "name": "example collection",
    "description": "example collection description",
    "categories": [
        {name: 'Tytuł', subcategories: [{name: "Podtytuł", subcategories: []}]},
        {name: 'Artyści', subcategories: []},
        {name: 'Rok', subcategories: []},
    ],
    "__v": 0
}

export const artworkIds = ["6752ddca46e3ca48231024dc", "6752ddca46e3ca48231024aa", "6752ddca46e3ca48231024bb"]
export const artworkTitles = ["Jakym jechoł koło dworu", "Ojcze, ojcze, kup mi kónia", "Piękna jagoda"]
export const artworkSubTitles = [
    "Tradycyjna pieśń ludowa o młodzieńcu przejeżdżającym obok dworu.", 
    "Serdeczna prośba dziecka do ojca o konia.", 
    "Liryczny hołd dla piękna, symbolizowanego przez dojrzałą jagodę."]

export const artworksData = {
    "artworks": [
        {
            "_id": artworkIds[0],
            "categories": [
                {
                    "name": "Tytuł",
                    "value": 
                        artworkTitles[0]
                    ,
                    "subcategories": [
                        {
                            name: "Podtytuł",
                            value: artworkSubTitles[0]
                        }
                    ]
                },
                {
                    "name": "Artyści",
                    "value": 
                        "Józefa Piaskowska"
                    ,
                    "subcategories": []
                },
                {
                    "name": "Rok",
                    "value": 
                        "1960"
                    ,
                    "subcategories": []
                },
            ],
            "collectionName": collectionData.name,
            "__v": 0,
            "createdAt": "2024-12-06T11:19:38.327Z",
            "updatedAt": "2024-12-06T11:19:38.327Z"
        },
        {
            "_id": artworkIds[1],
            "categories": [
                {
                    "name": "Tytuł",
                    "value": 
                        artworkTitles[1]
                    ,
                    "subcategories": [
                        {
                            name: "Podtytuł",
                            value: artworkSubTitles[1]
                        }
                    ]
                },
                {
                    "name": "Artyści",
                    "value": 
                        "Magdalena Figlak"
                    ,
                    "subcategories": []
                },
                {
                    "name": "Rok",
                    "value": 
                        "1949"
                    ,
                    "subcategories": []
                },
            ],
            "collectionName": collectionData.name,
            "__v": 0,
            "createdAt": "2024-12-06T11:19:38.327Z",
            "updatedAt": "2024-12-06T11:19:38.327Z"
        },
        {
            "_id": artworkIds[2],
            "categories": [
                {
                    "name": "Tytuł",
                    "value": 
                        artworkTitles[2]
                    ,
                    "subcategories": [
                        {
                            name: "Podtytuł",
                            value: artworkSubTitles[0]
                        }
                    ]
                },
                {
                    "name": "Artyści",
                    "value": 
                        "Zespół Mazowsze"
                    ,
                    "subcategories": []
                },
                {
                    "name": "Rok",
                    "value": 
                        "2005"
                    ,
                    "subcategories": []
                },
            ],
            "collectionName": collectionData.name,
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
                    "value": 
                        "W górach, nad rzeką"
                    ,
                    "subcategories": [
                        {
                            name: "Podtytuł",
                            value: "Opowieść o życiu w sercu natury"
                        }
                    ]
                },
                {
                    "name": "Artyści",
                    "value": 
                        "Józefa Piaskowska"
                    ,
                    "subcategories": []
                },
                {
                    "name": "Rok",
                    "value": 
                        "1960"
                    ,
                    "subcategories": []
                },
            ],
            "collectionName": collectionData.name,
            "__v": 0,
            "createdAt": "2024-12-06T11:19:38.327Z",
            "updatedAt": "2024-12-06T11:19:38.327Z"
        },
        {
            "_id": "6752aaaa46e5db48231024dc",
            "categories": [
                {
                    "name": "Tytuł",
                    "value": 
                        "Skrzypce na polu"
                    ,
                    "subcategories": [
                        {
                            name: "Podtytuł",
                            value: "Pieśń zagrana wśród zbóż"
                        }
                    ]
                },
                {
                    "name": "Artyści",
                    "value": 
                        "Magdalena Figlak"
                    ,
                    "subcategories": []
                },
                {
                    "name": "Rok",
                    "value": 
                        "1949"
                    ,
                    "subcategories": []
                },
            ],
            "collectionName": collectionData.name,
            "__v": 0,
            "createdAt": "2024-12-06T11:19:38.327Z",
            "updatedAt": "2024-12-06T11:19:38.327Z"
        },
        {
            "_id": "1234aaca46e3ca48231024bb",
            "categories": [
                {
                    "name": "Tytuł",
                    "value": 
                        "Pragnom uoczka, pragnom"
                    ,
                    "subcategories": [
                        {
                            name: "Podtytuł",
                            value: "Tęsknota zapisana w spojrzeniu"
                        }
                    ]
                },
                {
                    "name": "Artyści",
                    "value": 
                        "Zespół Mazowsze"
                    ,
                    "subcategories": []
                },
                {
                    "name": "Rok",
                    "value": 
                        "2005"
                    ,
                    "subcategories": []
                },
            ],
            "collectionName": collectionData.name,
            "__v": 0,
            "createdAt": "2024-12-06T11:19:38.327Z",
            "updatedAt": "2024-12-06T11:19:38.327Z"
        },
    ],
    "total": 6,
    "currentPage": 1,
    "pageSize": 3
}