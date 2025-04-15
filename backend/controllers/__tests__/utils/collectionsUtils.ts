const collectionCategoriesBeforeUpdate = [{name: "Tytuł", subcategories: []}]

export const jwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3Rvd3kiLCJmaXJzdE5hbWUiOiJ0ZXN0b3d5IiwidXN"
	+ "lcklkIjoiNjZiNjUwNmZiYjY0ZGYxNjVlOGE5Y2U2IiwiaWF0IjoxNzI0MTg0MTE0LCJleHAiOjE3MjUxODQxMTR9.fzHPaXFMzQTVUf9IdZ0G6oeiaecc"
	+ "N-rDSjRS3kApqlA"
export const collectionId = "66c4e516d6303ed5ac5a8e55"
export const collectionName = "collection"
export const collectionDescription = "collection description"

export const startSessionDefaultReturnValue = Promise.resolve({
    withTransaction: (async (transactionFunc: Function) => {
        await transactionFunc()
    }),
    endSession: jest.fn()      
})

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