import {describe, expect, test, jest, beforeEach} from "@jest/globals"
import {prepRecords} from "../data-import"

const mockGetAllCategories = jest.fn()
jest.mock("../categories", () => ({
    getAllCategories: () => mockGetAllCategories(),
}))

describe('data-import controller util functions tests', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    test.each([
        {
            testName: 'prepRecords test - three levels deep data',
            data: [
                ['Title', 'Title.Subtitle', 'Title.Subtitle.Subsubtitle', 'Artists'],
                ['title 1', 'subtitle 1',
                'subsubtitle 1'],
            ],
            getAllCategories: ['Title', 'Title.Subtitle', 'Title.Subtitle.Subsubtitle', 'Artists']
        },
        {
            testName: 'prepRecords test - unusual column order',
            data: [ ['Title.Subtitle', 'Title', 'Title.Subtitle.Subsubtitle'],
            ['subtitle 1', 'title 1', 
                'subsubtitle 1']],
            getAllCategories: ['Title.Subtitle', 'Title', 'Title.Subtitle.Subsubtitle']
        },
        {
            testName: 'prepRecords test - skipped category values in some records',
            data: [
                ['Title', 'Artists', 'Release Year'],
                ['title 1', '', 'release year 1'],
                ['', 'artists 2', 'release year 2'],
                ['title 3', '', ''],
            ],
            getAllCategories: ['Title', 'Artists', 'Release Year']
        },
        {
            testName: 'prepRecords test - trim all whitespace category values to empty string',
            data: [
                ['Title', 'Title.Subtitle', 'Artists'],
                ['title 1', ' ', ' ',]

            ],
            getAllCategories: ['Title', 'Title.Subtitle', 'Artists']
        },
        {
            testName: 'prepRecords test - remove leading/trailing whitespace in each part of full category name',
            data: [
                [' Title', 'Title . Subtitle ', '  Artists   '],
                ['title 1', 'subtitle 1', 'artists 1',]

            ],
            getAllCategories: ['Title', 'Title.Subtitle', 'Artists']
        },
        {
            testName: 'prepRecords test - remove leading/trailing whitespace in category values',
            data: [
                ['Title', 'Title.Subtitle', 'Artists'],
                ['  title 1   ', '  subtitle 1   ', '    artists 1    ',]

            ],
            getAllCategories: ['Title', 'Title.Subtitle', 'Artists']
        },
    ])(`$testName`,
        async ({data, getAllCategories}) => {
            mockGetAllCategories.mockReturnValue(getAllCategories)
            expect(await prepRecords(data,
                "collection", false
            )).toMatchSnapshot()
        }
    )

    test.each([
        {
            testName: 'prepRecords test - throw error when missing categories in header when importing to already existing collection',
            data: [
                ['Title', 'Artists'],
                ['title 1', 'artist 1'],
            ],
            getAllCategories: ['Title', 'Artists', 'Year'],
            asCollection: false
        },
        {
            testName: 'prepRecords test - throw error when unnecessary categories in header when importing to already existing collection',
            data: [
                ['Title', 'Artists', "Year"],
                ['title 1', 'artist 1', "1999"],
            ],
            getAllCategories: ['Title', 'Artists'],
            asCollection: false
        },
        {
            testName: 'prepRecords test - throw error when duplicate names in header',
            data: [
                ['Title', 'Title.Subtitle', 'Artists', 'Title.Subtitle'],
                ['title 1', 'subtitle 1', 'artists 1', 'subtitle 1'],
            ],
            getAllCategories: undefined,
            asCollection: true
        },
        {
            testName: 'prepRecords test - throw error when row contains more columns than the header',
            data: [
                ['Title', 'Artists', ''],
                ['title 1', 'artists 1', 'error causing value'],
            ],
            getAllCategories: undefined,
            asCollection: true
        },
        {
            testName: 'prepRecords test - throw error when header has empty fields',
            data: [
                ['Title', '', 'Artists'],
                ['title 1', 'some value', 'artists 1'],
            ],
            getAllCategories: undefined,
            asCollection: true
        },
        {
            testName: 'prepRecords test - throw error when parent category of some subcategory is missing',
            data: [
                ['Title', 'Title.MissingSubcategory.Subtitle'],
                ['title 1', 'subtitle 1'],
            ],
            getAllCategories: undefined,
            asCollection: true
        },
        {
            testName: 'prepRecords test - throw error when no subcategory name after the dot symbol in header field',
            data: [
                ['Title', 'Title.'],
                ['title 1', 'some value'],
            ],
            getAllCategories: undefined,
            asCollection: true
        },
        {
            testName: 'prepRecords test - throw error when subcategory name is only whitespace',
            data: [
                ['Title', 'Title. '],
                ['title 1', 'some value'],
            ],
            getAllCategories: undefined,
            asCollection: true
        }
    ])(`$testName`,
        ({data, getAllCategories, asCollection}) => {
            mockGetAllCategories.mockReturnValue(getAllCategories)
            expect(async () => await prepRecords(data,
                "collection", asCollection
            )).rejects.toThrow("Invalid data in the spreadsheet file")
        }
    )
})