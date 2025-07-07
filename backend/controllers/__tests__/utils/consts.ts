export const artworkId = "66ce0bf156199c1b8df5db7d"

const collectionCategoriesBeforeUpdate = [{name: "Tytuł", subcategories: []}]

export const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXN"
	+ "lcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaecc"
	+ "N-rDSjRS3kApqlA"
export const collectionId = "66c4e516d6303ed5ac5a8e55"
export const collectionName = "collection"
export const collectionDescription = "collection description"

export const oneCollectionData = {
    _id: collectionId,
    name: collectionName,
    description: 'collection description',
    categories: [
        {name: 'Tytuł', subcategories: []}
    ],
    __v: 0
}

export const getArtworkFindByIdReturnValue = {
    exec: jest.fn().mockReturnValue(Promise.resolve({
        _id: `${artworkId}`,
        categories: [{name: 'Title', value: "Title", subcategories: []}],
        collectionName: collectionName,
        createdAt: new Date("2024-09-10T12:17:12.821Z"),
        updatedAt: new Date("2024-09-10T12:17:12.821Z"),
        __v: 0
    }))
}

export const getArtworksForPageRecords = [
    {
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
]

export const getArtworksForPageFindReturnValue = {sort: () => ({exec: () => Promise.resolve(getArtworksForPageRecords)})}

export const startSessionDefaultReturnValue = Promise.resolve({
    withTransaction: (async (transactionFunc: Function) => {
        await transactionFunc()
    }),
    endSession: jest.fn()      
})

export const getArtworksBySearchTextMatchedInTopmostCategoryArtworkFindReturnValue = {limit: () => ({
    exec: () => ([
        {
            "_id":"680d3aaa071644252a168caa",
            "collectionName":"collection",
            "categories":[{"name":"Tytuł","value":"Searched Text","subcategories":[]}],
            "createdAt":"2025-04-26T19:57:30.007Z",
            "updatedAt":"2025-04-26T19:57:30.007Z",
            "__v":0
        }
    ])
})}

export const createArtworkConstructorReturnValue = {
    __v: 0,
    _id: "66ce0bf156199c1b8df5db7d",
    categories: [
        {
        "name": "Title",
        "subcategories": [],
        "value": "Title",
        },
    ],
    collectionName: "collection",
    createdAt: "2024-08-27T17:25:05.352Z",
    updatedAt: "2024-08-27T17:25:05.352Z",
    save: () => {}
}

export const createArtworkConstructorReturnValueWithSaveError = {
    __v: 0,
    _id: "66ce0bf156199c1b8df5db7d",
    categories: [
        {
        "name": "Title",
        "subcategories": [],
        "value": "Title",
        },
    ],
    collectionName: "collection",
    createdAt: "2024-08-27T17:25:05.352Z",
    updatedAt: "2024-08-27T17:25:05.352Z",
    save: () => {throw Error()}
}

export const collectionFindByIdNotFound = () => {return {exec: () => Promise.resolve(null)}}

export const collectionFindByIdHappyPath = () => {return {exec: () => Promise.resolve({
    _id: collectionId,
    name: collectionName,
    description: collectionDescription,
    categories: collectionCategoriesBeforeUpdate,
    __v: 0,
    save: () => {}
})}}

export const collectionFindByIdSaveFailed = () => {return {exec: () => Promise.resolve({
    _id: collectionId,
    name: collectionName,
    description: collectionDescription,
    categories: collectionCategoriesBeforeUpdate,
    __v: 0,
    save: () => {throw Error()}
})}}

export const artworkFindHappyPath = () => {return {exec: () => Promise.resolve([
    {
        _id: 'aaaaaaaad628570afa5357c3',
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
        collectionName: collectionName,
        save: () => {}
    },
])}}

export const artworkFindOneHappyPath = () => {return {exec: () => Promise.resolve(
    {
        _id: 'aaaaaaaad628570afa5357c3',
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
        collectionName: collectionName,
        save: () => {}
    },
)}}

export const artworkFindSaveFailed = () => {return {exec: () => Promise.resolve([
    {
        _id: 'aaaaaaaad628570afa5357c3',
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
        collectionName: collectionName,
        save: () => {throw Error()}
    },
])}}

export const artworkWithUpdatedcategories = [
    { name: 'Tytuł', value: 'testowy', subcategories: []}, 
    { name: 'Wykonawca', value: '', subcategories: []},
]

export const createArtworkHappyPathArtworkFiles = [
    {
        "originalFilename": "FileForUpload.mid",
        "newFilename": "66ce0bf156199c1b8df5db7d-5c61e079-490a-4f94-8f71-ee451f95d454.mid",
        "filePath": "uploads/685f7329d533636e3b130f86/66ce0bf156199c1b8df5db7d-5c61e079-490a-4f94-8f71-ee451f95d454.mid",
        "size": 8444,
        "uploadedAt": "2025-06-29T09:54:43.477Z",
        "_id": "68610d6315370d23b553524e"
    },
    {
        "originalFilename": "FileForUpload2.mid",
        "newFilename": "68610d6315370d23b553524c-d78c005d-8a13-4219-b997-d160679c1142.mid",
        "filePath": "uploads/685f7329d533636e3b130f86/66ce0bf156199c1b8df5db7d-d78c005d-8a13-4219-b997-d160679c1142.mid",
        "size": 8444,
        "uploadedAt": "2025-06-29T09:54:43.479Z",
        "_id": "68610d6315370d23b553524f"
    }
]

export const createArtworkHappyPathHandleFileUploadsReturnValue = {
    "savedFilesCount": 2,
    "failedUploadsCount": 0,
    "failedUploadsCauses": [],
}

export const artworksForDeletion = [
    {
        _id: "662e92a5d628570afa5357bc",
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
        files: [],
        collectionName: collectionName
    },
    {
        _id: "662e928b11674920c8cc0abc",
        createdAt: '2024-10-22T20:12:12.209Z',
        updatedAt: '2024-10-22T20:12:12.209Z',
        __v: 0,
        categories: [
        {
            name: 'Tytuł',
            value: 'testowy 2',
            subcategories: []
        },
        ],
        files: [],
        collectionName: collectionName
    },
]

export const foundArtwork = {
    "_id": artworkId,
    "collectionName": collectionName,
    "categories": [
        {
            "name": "Title",
            "value": "Title",
            "subcategories": []
        }
    ],
    "files": [
        {
            "originalFilename": "FileForUpload.mid",
            "newFilename": `${artworkId}_0.mid`,
            "filePath": `uploads/${collectionId}/${artworkId}_0.mid`,
            "size": 8444,
            "uploadedAt": "2025-07-07T19:10:54.980Z",
            "_id": "686c1bbe3db614c9584d275b"
        }
    ],
    "createdAt": "2025-07-07T19:10:54.938Z",
    "updatedAt": "2025-07-07T19:10:54.982Z",
    "__v": 1,
    save: () => {}
}

export const foundArtworkWithSaveError = {
    "_id": artworkId,
    "collectionName": collectionName,
    "categories": [
        {
            "name": "Title",
            "value": "Title",
            "subcategories": []
        }
    ],
    "files": [
        {
            "originalFilename": "FileForUpload.mid",
            "newFilename": `${artworkId}_0.mid`,
            "filePath": `uploads/${collectionId}/${artworkId}_0.mid`,
            "size": 8444,
            "uploadedAt": "2025-07-07T19:10:54.980Z",
            "_id": "686c1bbe3db614c9584d275b"
        }
    ],
    "createdAt": "2025-07-07T19:10:54.938Z",
    "updatedAt": "2025-07-07T19:10:54.982Z",
    "__v": 1,
    save: () => {throw Error()}
}

export const foundArtworkWithDifferentCollectionName = {
    "_id": artworkId,
    "collectionName": "different collection name",
    "categories": [
        {
            "name": "Title",
            "value": "Title",
            "subcategories": []
        }
    ],
    "files": [
        {
            "originalFilename": "FileForUpload.mid",
            "newFilename": `${artworkId}_0.mid`,
            "filePath": `uploads/${collectionId}/${artworkId}_0.mid`,
            "size": 8444,
            "uploadedAt": "2025-07-07T19:10:54.980Z",
            "_id": "686c1bbe3db614c9584d275b"
        }
    ],
    "createdAt": "2025-07-07T19:10:54.938Z",
    "updatedAt": "2025-07-07T19:10:54.982Z",
    "__v": 1,
    save: () => {}
}

export const handleFileUploadsReturnValue = {
    uploadedFilesCount: 0,
    failedUploadsCount: 0,
    failedUploadsCauses: []
}

export const handleFileDeleteReturnValue = {
    deletedFilesCount: 0,
    failedDeletesCount: 0,
    failedDeletesCauses: []
}