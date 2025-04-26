import {describe, expect, test, jest, beforeEach} from "@jest/globals"
import { constructQuickSearchFilter, constructAdvSearchFilter, sortRecordsByCategory, updateArtworkCategories, constructTopmostCategorySearchTextFilter } from "../artworks"

const mockGetAllCategories = jest.fn()
jest.mock("../../utils/categories", () => ({
    getAllCategories: () => mockGetAllCategories(),
}))

const collectionId = "66f2194a6123d7f50558cd8f"
const collectionName = "collection"

describe('artworks util functions tests', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    }) 

    test.each([
      {
        testCase: "empty arrays",
        artworkSubcategories: [],
        collectionSubcategories: []
      },
      {
        testCase: "structure not changed",
        artworkSubcategories: [
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
        ],
        collectionSubcategories: [
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
      },
      {
        testCase: "only category names changed",
        artworkSubcategories: [
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
        ],
        collectionSubcategories: [
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
      },
      {
        testCase: "new categories and subcategories",
        artworkSubcategories: [
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
        ],
        collectionSubcategories: [
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
        ],
      },
    ])("updateArtworkCategories test - $testCase", ({artworkSubcategories, collectionSubcategories}) => {
      expect(updateArtworkCategories(artworkSubcategories, collectionSubcategories)).toMatchSnapshot()
    })

    test.each([
        {
            maxDepth: 0,
            categories: []
        },
        {
            maxDepth: 1,
            categories: ["Tytuł", "Artyści", "Rok",]
        },
        {
            maxDepth: 4,
            categories: [
                "Tytuł",
                "Tytuł.Podtytuł",
                "Tytuł.Podtytuł.Podpodtytuł",
                "Artyści",
                "Rok",
                "Rok.Miesiąc",
                "Rok.Miesiąc.Dzień",
                "Tytuł.Znaczenie tytułu",
                "Rok.Kwartał",
                "Rok.Kwartał.Miesiąc",
                "Rok.Kwartał.Miesiąc.Dzień",
              ]
        },
    ])(`constructQuickSearchFilter test - maxDepth=$maxDepth`,
        async ({categories}) => {
            mockGetAllCategories.mockReturnValue(categories)

            expect(await constructQuickSearchFilter("text to find", collectionId, collectionName)).toMatchSnapshot()
        }
    )

    it("constructTopmostCategorySearchTextFilter test", () => {
      expect(constructTopmostCategorySearchTextFilter("Searched text")).toMatchSnapshot()
    })

    test.each([
        {
            case: "standard input",
            query: {
                page: '1',
                pageSize: '10',
                search: 'true',
                'Tytuł': 'testowy',
                'Tytuł.Podtytuł': 'testowy podtytuł',
                'Tytuł.Podtytuł.Podpodtytuł.Podpodpodtytuł': 'testowy podpodpodtytuł',
                'Artyści': 'testowi',
                'Rok.Miesiąc': 'Luty',
                Rok: '966'
              }
        },
        {
            case: "no search rules",
            query: {
                page: '1',
                pageSize: '10',
                search: 'true',
              }
        },
    ])(`constructAdvSearchFilter test - $case`,
        async ({query}) => {
            expect(await constructAdvSearchFilter(query, collectionName)).toMatchSnapshot()
        }
    )

    test.each([
        {
            case: "sort by Tytuł asc",
            records: [
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
              ],
            order: 'Tytuł-asc'
        },
        {
            case: "sort by Tytuł desc",
            records: [
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
              ],
            order: 'Tytuł-desc'
        },
        {
            case: "sort by Artyści asc",
            records: [
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
              ],
            order: 'Artyści-asc'
        },
        {
            case: "nonexistent category to sort by",
            records: [
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
              ],
            order: 'Nonexistent-asc'
        },
        {
            case: "category to sort records by doesn't exist on some records",
            records: [
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
              ],
            order: 'Tytuł-asc'
        },
    ])(`sortRecordsByCategory test - $case`,
        async ({records, order}) => {
            expect(sortRecordsByCategory(records, order)).toMatchSnapshot()
        }
    )
})