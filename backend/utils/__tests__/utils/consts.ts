import e from "express"
import { ClientSession } from "mongoose"

export const collectionIds = ["66f2194a6123d7f50558cd8f", "12f3494a6123d7f50558cd8f"]
export const collectionNames = ["collection", "collection 2"]
export const collectionName = collectionNames[0]
export const artworkId = "686e6904842ac306fa7e814f"


export const session = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
} as unknown as ClientSession

export const artworkSubcategoriesStructureNotChanged = [
    { name: "Wykonawca", value: "some value", subcategories: []},
    { name: "Rok", value: "some value 2", subcategories: [
        {name: "Miesiąc", value: "some subvalue 1", subcategories: [
            {name: "Dzień", value: "some subsubvalue 1", subcategories: []}
        ]},
        {name: "Jakaś kategoria", value: "some subvalue 2", subcategories: []},
    ]},
    { name: "Region", value: "some value 3", subcategories: [
        {name: "Podregion", value: "some subvalue 1", subcategories: []}
    ]},
]

export const collectionSubcategoriesStructureNotChanged = [
    { name: "Wykonawca", subcategories: [] },
    { name: "Rok", subcategories: [
        {name: "Miesiąc", subcategories: [
            {name: "Dzień", subcategories: []}
        ]},
        {name: "Jakaś kategoria", subcategories: []},
    ] },
    { name: "Region", subcategories: [
        {name: "Podregion", subcategories: []}
    ] }
]

export const artworkSubcategoriesCategoryNamesChanged = [
    { name: "Wykonawca", value: "some value", subcategories: []},
    { name: "Rok", value: "some value 2", subcategories: [
        {name: "Kwartał", value: "some subvalue 1", subcategories: [
            {name: "Miesiąc", value: "some subsubvalue 1", subcategories: []}
        ]},
        {name: "Jakaś kategoria", value: "some subvalue 2", subcategories: []},
    ]},
    { name: "Miejsce pochodzenia", value: "some value 3", subcategories: [
        {name: "Region", value: "some subvalue 1", subcategories: []}
    ]},
]

export const collectionSubcategoriesCategoryNamesChanged = [
    { name: "Artysta", subcategories: [] },
    { name: "Rok", subcategories: [
        {name: "Miesiąc", subcategories: [
            {name: "Dzień", subcategories: []}
        ]},
        {name: "Jakaś kategoria", subcategories: []},
    ] },
    { name: "Region", subcategories: [
        {name: "Podregion", subcategories: []}
    ] }
]

export const artworkSubcategoriesNewCategoriesAndSubcategories = [
    { name: "Wykonawca", value: "some value", subcategories: []},
    { name: "Rok", value: "some value 2", subcategories: [
        {name: "Miesiąc", value: "some subvalue 1", subcategories: [
            {name: "Dzień", value: "some subsubvalue 1", subcategories: []}
        ]},
        {name: "Jakaś kategoria", value: "some subvalue 2", subcategories: []},
    ]},
    { name: "Region", value: "some value 3", subcategories: [
        {name: "Podregion", value: "some subvalue 1", subcategories: []}
    ]},
]

export const collectionSubcategoriesNewCategoriesAndSubcategories = [
    { name: "Wykonawca", subcategories: [] },
    { name: "Rok", subcategories: [
        {name: "Miesiąc", subcategories: [
            {name: "Dzień", subcategories: []},
            {name: "Nowa podpodkategoria", subcategories: [
                {name: "Nowa podpodpodkategoria", subcategories: [
                    {name: "Nowa podpodpodpodkategoria", subcategories: []}
                ]},
                {name: "Nowa podpodpodkategoria 2", subcategories: []},
            ]}
        ]},
        {name: "Jakaś kategoria", subcategories: []},
    ] },
    { name: "Region", subcategories: [
        {name: "Podregion", subcategories: []},
        {name: "Nowa podkategoria", subcategories: []}
    ] },
    {name: "Nowa kategoria", subcategories: []},
    {name: "Nowa kategoria 2", subcategories: []}
]

export const recordsSortByTytulAsc = [
    {
        _id: "6718f272c89e4d053eebb5d8",
        categories: [
            {
                name: 'Tytuł',
                value: 'Tytułowy',
                subcategories: [ { name: 'Podtytuł', value: 'podtytuł' } ]
            },
            { name: 'Artyści', value: 'Jan Nowak', subcategories: [] },
            { name: 'Rok', value: '567', subcategories: [] }
        ],
        collectionName: collectionName,
        createdAt: '2024-10-23T12:56:18.209Z',
        updatedAt: '2024-10-23T12:56:18.209Z',
        __v: 0
    },
    {
        _id: "6718f28bc89e4d053eebb5df",
        categories: [
            { name: 'Tytuł', value: 'Inny tytuł', subcategories: [] },
            {
                name: 'Artyści',
                value: 'Inny artysta',
                subcategories: []
            },
            { name: 'Rok', value: '1410', subcategories: [] }
        ],
        collectionName: collectionName,
        createdAt: '2024-10-23T12:56:43.182Z',
        updatedAt: '2024-10-23T12:56:43.182Z',
        __v: 0
    },
    {
        _id: "6718f2bfc89e4d053eebb5e6",
        categories: [
            {
                name: 'Tytuł',
                value: 'Kolejny tytuł',
                subcategories: [ { name: 'Podtytuł', value: 'Jakiś podtytuł' } ]
            },
            { name: 'Artyści', value: 'Pierwsi', subcategories: [] },
            { name: 'Rok', value: '444', subcategories: [] }
        ],
        collectionName: collectionName,
        createdAt: '2024-10-23T12:57:35.366Z',
        updatedAt: '2024-10-23T12:57:35.366Z',
        __v: 0
    }
]

export const recordsSortByTytulDesc = [
    {
        _id: "6718f272c89e4d053eebb5d8",
        categories: [
            {
                name: 'Tytuł',
                value: 'Tytułowy',
                subcategories: [ { name: 'Podtytuł', value: 'podtytuł' } ]
            },
            { name: 'Artyści', value: 'Jan Nowak', subcategories: [] },
            { name: 'Rok', value: '567', subcategories: [] }
        ],
        collectionName: collectionName,
        createdAt: '2024-10-23T12:56:18.209Z',
        updatedAt: '2024-10-23T12:56:18.209Z',
        __v: 0
    },
    {
        _id: "6718f28bc89e4d053eebb5df",
        categories: [
            { name: 'Tytuł', value: 'Inny tytuł', subcategories: [] },
            {
                name: 'Artyści',
                value: 'Inny artysta',
                subcategories: []
            },
            { name: 'Rok', value: '1410', subcategories: [] }
        ],
        collectionName: collectionName,
        createdAt: '2024-10-23T12:56:43.182Z',
        updatedAt: '2024-10-23T12:56:43.182Z',
        __v: 0
    },
    {
        _id: "6718f2bfc89e4d053eebb5e6",
        categories: [
            {
                name: 'Tytuł',
                value: 'Kolejny tytuł',
                subcategories: [ { name: 'Podtytuł', value: 'Jakiś podtytuł' } ]
            },
            { name: 'Artyści', value: 'Pierwsi', subcategories: [] },
            { name: 'Rok', value: '444', subcategories: [] }
        ],
        collectionName: collectionName,
        createdAt: '2024-10-23T12:57:35.366Z',
        updatedAt: '2024-10-23T12:57:35.366Z',
        __v: 0
    }
]

export const recordsSortByArtysciAsc = [
    {
        _id: "6718f272c89e4d053eebb5d8",
        categories: [
            {
                name: 'Tytuł',
                value: 'Tytułowy',
                subcategories: [ { name: 'Podtytuł', value: 'podtytuł' } ]
            },
            { name: 'Artyści', value: 'Jan Nowak', subcategories: [] },
            { name: 'Rok', value: '567', subcategories: [] }
        ],
        collectionName: collectionName,
        createdAt: '2024-10-23T12:56:18.209Z',
        updatedAt: '2024-10-23T12:56:18.209Z',
        __v: 0
    },
    {
        _id: "6718f28bc89e4d053eebb5df",
        categories: [
            { name: 'Tytuł', value: 'Inny tytuł', subcategories: [] },
            {
                name: 'Artyści',
                value: 'Inny artysta',
                subcategories: []
            },
            { name: 'Rok', value: '1410', subcategories: [] }
        ],
        collectionName: collectionName,
        createdAt: '2024-10-23T12:56:43.182Z',
        updatedAt: '2024-10-23T12:56:43.182Z',
        __v: 0
    },
    {
        _id: "6718f2bfc89e4d053eebb5e6",
        categories: [
            {
                name: 'Tytuł',
                value: 'Kolejny tytuł',
                subcategories: [ { name: 'Podtytuł', value: 'Jakiś podtytuł' } ]
            },
            { name: 'Artyści', value: 'Pierwsi', subcategories: [] },
            { name: 'Rok', value: '444', subcategories: [] }
        ],
        collectionName: collectionName,
        createdAt: '2024-10-23T12:57:35.366Z',
        updatedAt: '2024-10-23T12:57:35.366Z',
        __v: 0
    }
]

export const recordsNonexistentSortByCategory = [
    {
        _id: "6718f272c89e4d053eebb5d8",
        categories: [
            {
                name: 'Tytuł',
                value: 'Tytułowy',
                subcategories: [ { name: 'Podtytuł', value: 'podtytuł' } ]
            },
            { name: 'Artyści', value: 'Jan Nowak', subcategories: [] },
            { name: 'Rok', value: '567', subcategories: [] }
        ],
        collectionName: collectionName,
        createdAt: '2024-10-23T12:56:18.209Z',
        updatedAt: '2024-10-23T12:56:18.209Z',
        __v: 0
    },
    {
        _id: "6718f28bc89e4d053eebb5df",
        categories: [
            { name: 'Tytuł', value: 'Inny tytuł', subcategories: [] },
            {
                name: 'Artyści',
                value: 'Inny artysta',
                subcategories: []
            },
            { name: 'Rok', value: '1410', subcategories: [] }
        ],
        collectionName: collectionName,
        createdAt: '2024-10-23T12:56:43.182Z',
        updatedAt: '2024-10-23T12:56:43.182Z',
        __v: 0
    },
    {
        _id: "6718f2bfc89e4d053eebb5e6",
        categories: [
            {
                name: 'Tytuł',
                value: 'Kolejny tytuł',
                subcategories: [ { name: 'Podtytuł', value: 'Jakiś podtytuł' } ]
            },
            { name: 'Artyści', value: 'Pierwsi', subcategories: [] },
            { name: 'Rok', value: '444', subcategories: [] }
        ],
        collectionName: collectionName,
        createdAt: '2024-10-23T12:57:35.366Z',
        updatedAt: '2024-10-23T12:57:35.366Z',
        __v: 0
    }
]

export const recordsNonexistentSortByCategoryOnSomeRecords = [
    {
        _id: "6718f272c89e4d053eebb5d8",
        categories: [
            {
                name: 'Tytuł',
                value: 'Tytułowy',
                subcategories: [ { name: 'Podtytuł', value: 'podtytuł' } ]
            },
            { name: 'Artyści', value: 'Jan Nowak', subcategories: [] },
            { name: 'Rok', value: '567', subcategories: [] }
        ],
        collectionName: collectionName,
        createdAt: '2024-10-23T12:56:18.209Z',
        updatedAt: '2024-10-23T12:56:18.209Z',
        __v: 0
    },
    {
        _id: "6718f2bfc89e4d053eebb5e6",
        categories: [
            { name: 'Artyści', value: 'Pierwsi', subcategories: [] },
            { name: 'Rok', value: '444', subcategories: [] }
        ],
        collectionName: collectionName,
        createdAt: '2024-10-23T12:57:35.366Z',
        updatedAt: '2024-10-23T12:57:35.366Z',
        __v: 0
    },
    {
        _id: "6718f28bc89e4d053eebb5df",
        categories: [
            { name: 'Tytuł', value: 'Inny tytuł', subcategories: [] },
            {
                name: 'Artyści',
                value: 'Inny artysta',
                subcategories: []
            },
            { name: 'Rok', value: '1410', subcategories: [] }
        ],
        collectionName: collectionName,
        createdAt: '2024-10-23T12:56:43.182Z',
        updatedAt: '2024-10-23T12:56:43.182Z',
        __v: 0
    },
    {
        _id: "6718f2bfc89e4d053eebb5e6",
        categories: [
            { name: 'Artyści', value: 'Pierwsi', subcategories: [] },
            { name: 'Rok', value: '444', subcategories: [] }
        ],
        collectionName: collectionName,
        createdAt: '2024-10-23T12:57:35.366Z',
        updatedAt: '2024-10-23T12:57:35.366Z',
        __v: 0
    }
]

export const recordsSortByCreatedAtOrUpdatedAtCase = [
    {
        _id: "6718f272c89e4d053eebb5d8",
        categories: [
            {
                name: 'Tytuł',
                value: 'Tytułowy',
                subcategories: [ { name: 'Podtytuł', value: 'podtytuł' } ]
            },
            { name: 'Artyści', value: 'Jan Nowak', subcategories: [] },
            { name: 'Rok', value: '567', subcategories: [] }
        ],
        collectionName: collectionName,
        createdAt: '2024-10-23T12:56:18.209Z',
        updatedAt: '2024-10-23T12:56:18.209Z',
        __v: 0
    },
    {
        _id: "6718f28bc89e4d053eebb5df",
        categories: [
            { name: 'Tytuł', value: 'Inny tytuł', subcategories: [] },
            {
                name: 'Artyści',
                value: 'Inny artysta',
                subcategories: []
            },
            { name: 'Rok', value: '1410', subcategories: [] }
        ],
        collectionName: collectionName,
        createdAt: '2024-10-23T12:56:43.182Z',
        updatedAt: '2024-10-23T12:56:43.182Z',
        __v: 0
    },
    {
        _id: "6718f2bfc89e4d053eebb5e6",
        categories: [
            {
                name: 'Tytuł',
                value: 'Kolejny tytuł',
                subcategories: [ { name: 'Podtytuł', value: 'Jakiś podtytuł' } ]
            },
            { name: 'Artyści', value: 'Pierwsi', subcategories: [] },
            { name: 'Rok', value: '444', subcategories: [] }
        ],
        collectionName: collectionName,
        createdAt: '2024-10-23T12:57:35.366Z',
        updatedAt: '2024-10-23T12:57:35.366Z',
        __v: 0
    }
]

export const twoArtworkFiles = [
    {
        originalFilename: 'MIDI_sample.mid',
        newFilename: `${artworkId}_0.mid`,
        filePath: `uploads/${collectionIds[0]}/${artworkId}_0.mid`,
        size: 8444,
        uploadedAt: expect.any(Date)
    },
    {
        originalFilename: 'MIDI_sample 2.mid',
        newFilename: `${artworkId}_1.mid`,
        filePath: `uploads/${collectionIds[0]}/${artworkId}_1.mid`,
        size: 8444,
        uploadedAt: expect.any(Date)
    }
]

export const fiveFilesToUpload = [
    {
        fieldname: 'files',
        originalname: 'lyrics.mei',
        encoding: '7bit',
        mimetype: 'application/octet-stream',
        buffer: "buffer content",
        size: 13085
    },
    {
        fieldname: 'files',
        originalname: 'example.mid',
        encoding: '7bit',
        mimetype: 'application/octet-stream',
        buffer: "buffer content",
        size: 13085
    },
    {
        fieldname: 'files',
        originalname: 'mei_file.mei',
        encoding: '7bit',
        mimetype: 'application/octet-stream',
        buffer: "buffer content",
        size: 13085
    },
    {
        fieldname: 'files',
        originalname: 'txt_file.txt',
        encoding: '7bit',
        mimetype: 'application/octet-stream',
        buffer: "buffer content",
        size: 13085
    },
    {
        fieldname: 'files',
        originalname: 'mxl_file.mxl',
        encoding: '7bit',
        mimetype: 'application/octet-stream',
        buffer: "buffer content",
        size: 13085
    }
]

export const fiveAddedFiles = [
    {
        originalFilename: 'lyrics.mei',
        newFilename: `${artworkId}_0.mei`,
        filePath: `uploads/${collectionIds[0]}/${artworkId}_0.mei`,
        size: expect.any(Number),
        uploadedAt: expect.any(Date),
    },
    {
        originalFilename: 'example.mid',
        newFilename: `${artworkId}_1.mid`,
        filePath: `uploads/${collectionIds[0]}/${artworkId}_1.mid`,
        size: expect.any(Number),
        uploadedAt: expect.any(Date)
    },
    {
        originalFilename: 'mei_file.mei',
        newFilename: `${artworkId}_2.mei`,
        filePath: `uploads/${collectionIds[0]}/${artworkId}_2.mei`,
        size: expect.any(Number),
        uploadedAt: expect.any(Date)
    },
    {
        originalFilename: 'txt_file.txt',
        newFilename: `${artworkId}_3.txt`,
        filePath: `uploads/${collectionIds[0]}/${artworkId}_3.txt`,
        size: expect.any(Number),
        uploadedAt: expect.any(Date)
    },
    {
        originalFilename: 'mxl_file.mxl',
        newFilename: `${artworkId}_4.mxl`,
        filePath: `uploads/${collectionIds[0]}/${artworkId}_4.mxl`,
        size: expect.any(Number),
        uploadedAt: expect.any(Date)
    },
]

export const twoArtworkFilesWithIndices0and2 = [
    {
        originalFilename: 'MIDI_sample.mid',
        newFilename: `${artworkId}_0.mid`,
        filePath: `uploads/${collectionIds[0]}/${artworkId}_0.mid`,
        size: 8444,
        uploadedAt: "2025-08-09T19:28:45.093Z",
        _id: "6897a16dce55abb5265e658e"
    },
    {
        originalFilename: 'lyrics.mei',
        newFilename: `${artworkId}_2.mei`,
        filePath: `uploads/${collectionIds[0]}/${artworkId}_.mei`,
        size: 8444,
        uploadedAt: "2025-08-09T19:28:45.093Z",
        _id: "6897a16dce55abb5265e658e"
    }
]

export const twoFilesToUpload = [
    {
        fieldname: 'files',
        originalname: 'text_file.txt',
        encoding: '7bit',
        mimetype: 'application/octet-stream',
        buffer: "buffer content",
        size: 13085
    },
    {
        fieldname: 'files',
        originalname: 'lyrics2.mei',
        encoding: '7bit',
        mimetype: 'application/octet-stream',
        buffer: "buffer content",
        size: 13085
    },
]

export const addedArtworkFilesWithIndices1and3 = [
    {
        originalFilename: 'text_file.txt',
        newFilename: `${artworkId}_1.txt`,
        filePath: `uploads/${collectionIds[0]}/${artworkId}_1.txt`,
        size: expect.any(Number),
        uploadedAt: expect.any(Date)
    },
    {
        originalFilename: 'lyrics2.mei',
        newFilename: `${artworkId}_3.mei`,
        filePath: `uploads/${collectionIds[0]}/${artworkId}_3.mei`,
        size: expect.any(Number),
        uploadedAt: expect.any(Date)
    },
]

export const filesToUploadWithErrors = [
    {
        fieldname: 'files',
        originalname: 'MIDI_sample.mid',
        encoding: '7bit',
        mimetype: 'application/octet-stream',
        buffer: "buffer content",
        size: 8444
    },
    {
        fieldname: 'files',
        originalname: 'pdf_file.pdf',
        encoding: '7bit',
        mimetype: 'application/octet-stream',
        buffer: "buffer content",
        size: 8444
    },
    {
        fieldname: 'files',
        originalname: 'MIDI_sample 2.mid',
        encoding: '7bit',
        mimetype: 'application/octet-stream',
        buffer: "buffer content",
        size: 8444
    },
    {
        fieldname: 'files',
        originalname: 'lyrics.mei',
        encoding: '7bit',
        mimetype: 'application/octet-stream',
        buffer: "buffer content",
        size: 25 * 1024 * 1024 + 1
    },
]