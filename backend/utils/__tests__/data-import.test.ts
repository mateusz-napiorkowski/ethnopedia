import {describe, expect, test, jest, beforeEach} from "@jest/globals"
import {prepRecords} from "../data-import"

describe('data-import controller util functions tests', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    test.each([
        {
            testName: 'prepRecords test - three levels deep data',
            data: [
                ['Title', 'Title.Subtitle', 'Title.Subtitle.Subsubtitle', 'Artists'],
                ['title 1;alternate title 1', 'subtitle 1;alternate subtitle 1;another alternate subtitle 1',
                'subsubtitle 1;alternate subsubtitle 1;another alternate subsubtitle 1'],
            ]
        },
        {
            testName: 'prepRecords test - unusual column order',
            data: [ ['Title.Subtitle', 'Title', 'Title.Subtitle.Subsubtitle'],
            ['subtitle 1;alternate subtitle 1;another alternate subtitle 1', 'title 1;alternate title 1', 
                'subsubtitle 1;alternate subsubtitle 1;another alternate subsubtitle 1']]
        },
        {
            testName: 'prepRecords test - skipped category values in some records',
            data: [
                ['Title', 'Artists', 'Release Year'],
                ['title 1', '', 'release year 1'],
                ['', 'artists 2', 'release year 2'],
                ['title 3', '', ''],
            ]
        },
        {
            testName: 'prepRecords test - skip subcategory with empty values only if there are no deeper subcategories',
            data: [
                ['Title', 'Title.Subtitle', 'Title.Subtitle.Subsubtitle', 'Title.Subtitle.Subsubtitle.Subsubsubtitle', 'Title.Subtitle.Subsubtitle.Subsubsubtitle.Subsubsubsubtitle'],
                ['', 'subtitle 1', '', 'subsubsubtitle 1', ''],
                ['', '', '', '', 'subsubsubsubtitle 1']

            ]
        },
        {
            testName: 'prepRecords test - skip all whitespace category values',
            data: [
                ['Title', 'Title.Subtitle', 'Artists'],
                ['title 1; ;', ' ', ' ',]

            ]
        },
        {
            testName: 'prepRecords test - remove leading/trailing whitespace in each part of full category name',
            data: [
                [' Title', 'Title . Subtitle ', '  Artists   '],
                ['title 1', 'subtitle 1', 'artists 1',]

            ]
        },
        {
            testName: 'prepRecords test - remove leading/trailing whitespace in category values',
            data: [
                ['Title', 'Title.Subtitle ', 'Artists'],
                ['  title 1;  alternate title 1   ', '  subtitle 1; alternate subtitle 1   ', '    artists 1    ',]

            ]
        },
    ])(`$testName`,
        async ({data}) => {
            expect(prepRecords(data,
                "collection"
            )).toMatchSnapshot()
        }
    )

    test.each([
        {
            testName: 'prepRecords test - throw error when duplicate names in header',
            data: [
                ['Title', 'Title.Subtitle', 'Artists', 'Title.Subtitle'],
                ['title 1', 'subtitle 1', 'artists 1', 'subtitle 1'],
            ]
        },
        {
            testName: 'prepRecords test - throw error when row contains more columns than the header',
            data: [
                ['Title', 'Artists', ''],
                ['title 1', 'artists 1', 'error causing value'],
            ]
        },
        {
            testName: 'prepRecords test - throw error when header has empty fields',
            data: [
                ['Title', '', 'Artists'],
                ['title 1', 'some value', 'artists 1'],
            ]
        },
        {
            testName: 'prepRecords test - throw error when parent category of some subcategory is missing',
            data: [
                ['Title', 'Title.MissingSubcategory.Subtitle'],
                ['title 1', 'subtitle 1'],
            ]
        },
        {
            testName: 'prepRecords test - throw error when no subcategory name after the dot symbol in header field',
            data: [
                ['Title', 'Title.'],
                ['title 1', 'some value'],
            ]
        },
        {
            testName: 'prepRecords test - throw error when subcategory name is only whitespace',
            data: [
                ['Title', 'Title. '],
                ['title 1', 'some value'],
            ]
        }
    ])(`$testName`,
        async ({data}) => {
            expect(() => prepRecords(data,
                "collection"
            )).toThrow("Invalid data in the spreadsheet file")
        }
    )
})