import {describe, expect, test, jest, beforeEach} from "@jest/globals"
import { constructQuickSearchFilter, constructAdvSearchFilter, sortRecordsByCategory } from "../artworks"

const mockGetAllCategories = jest.fn()
jest.mock("../../utils/categories", () => ({
    getAllCategories: () => mockGetAllCategories(),
}))

describe('artworks util functions tests', () => {
    beforeEach(() => {
        jest.resetAllMocks()
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

            expect(await constructQuickSearchFilter("text to find", "collection")).toMatchSnapshot()
        }
    )

    test.each([
        {
            query: {
                page: '1',
                pageSize: '10',
                search: 'true',
                'Tytuł.Podtytuł.Podpodtytuł': 'podpodtytuł',
                'Tytuł': 'tytuł'
              }
        },
        {
            query: {
                page: '1',
                pageSize: '10',
                search: 'true',
              }
        },
    ])(`constructAdvSearchFilter test`,
        async ({query}) => {
            expect(await constructAdvSearchFilter(query, "collection")).toMatchSnapshot()
        }
    )
})