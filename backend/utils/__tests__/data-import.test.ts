import {describe, expect, test, jest, beforeEach} from "@jest/globals"
import {validateExcelData, prepUploadsDirAndArchiveBuffer, processArchiveFiles} from "../data-import"
import path from "path"
import fs from "fs"
import { Readable } from "stream";
import stream from "stream";
import unzipper from "unzipper"
import mongoose from "mongoose";


const readArchive = (filePath: string) => {
    const buffer = fs.readFileSync(filePath);
    const stats = fs.statSync(filePath);
    return {
        fieldname: "file",
        originalname: path.basename(filePath),
        encoding: "7bit",
        mimetype: "application/zip",
        size: stats.size,
        buffer,
        destination: path.dirname(filePath),
        filename: path.basename(filePath),
        path: filePath,
        stream: Readable.from(buffer),
    }
}

const mockWriteStream = new stream.Writable({
    write(_chunk, _encoding, callback) {
        callback();
    }
});

const collectionId = "66c4e516d6303ed5ac5a8e55"
const newRecordId  = "1234e516d6303ed5ac5a8e77"
const mockGetAllCategories = jest.fn()
jest.mock("../categories", () => ({
    getAllCategories: () => mockGetAllCategories(),
}))

describe('data-import controller util functions tests', () => {       
    beforeEach(() => {  
        jest.restoreAllMocks();
        jest.spyOn(fs, "createWriteStream").mockReturnValue(mockWriteStream as any);
    })

    test.each([
        {
            testname: "validateCategories test - missing categories in header when importing to existing collection",
            header: ['Title', 'Artists'],
            dataRows: [
                ["title 1", "artist 1"]
            ],
            getAllCategories: ['Title', 'Artists', 'Year'],
            asCollection: false,
            errorMessage: `Brakujące kategorie: Year, Nadmiarowe kategorie: `
        },
        {
            testname: "validateCategories test - unnecessary categories in header when importing to existing collection",
            header: ['Title', 'Artists', "Year"],
            dataRows: [
                ["title 1", "artist 1", "1999"]
            ],
            getAllCategories: ['Title', 'Artists'],
            asCollection: false,
            errorMessage: `Brakujące kategorie: , Nadmiarowe kategorie: Year`
        },
        {
            testname: "validateCategories test - duplicate categories in header",
            header: ['Title', 'Title.Subtitle', 'Artists', 'Title.Subtitle'],
            dataRows: [
                ["title 1", "subtitle 1", "artist 1", "subtitle 1"]
            ],
            getAllCategories: undefined,
            asCollection: true,
            errorMessage: `Header has duplicate values`
        },
        {
            testname: "validateCategories test - row contains more columns than the header",
            header: ['Title', 'Artists', ''],
            dataRows: [
                ['title 1', 'artists 1', 'error causing value']
            ],
            getAllCategories: undefined,
            asCollection: true,
            errorMessage: `Row contains more columns than the header`
        },
        {
            testname: "validateCategories test - row contains more columns than the header 2",
            header: ['Title', 'Artists'],
            dataRows: [
                ['title 1', 'artists 1', 'error causing value']
            ],
            getAllCategories: undefined,
            asCollection: true,
            errorMessage: `Row contains more columns than the header`
        },
        {
            testname: "validateCategories test - header has empty fields",
            header: ['Title', '', 'Years'],
            dataRows: [
                ['title 1', 'artist 1', '1999']
            ],
            getAllCategories: undefined,
            asCollection: true,
            errorMessage: `Header has empty fields`
        },
        {
            testname: "validateCategories test - parent category of some subcategory is missing",
            header: ['Title', 'Title.MissingSubcategory.Subtitle'],
            dataRows: [
                ['title 1', 'subtitle 1']
            ],
            getAllCategories: undefined,
            asCollection: true,
            errorMessage: `Missing parent category: 'Title.MissingSubcategory'`
        },
        {
            testname: "validateCategories test - no subcategory name after the dot symbol in header field",
            header: ['Title', 'Title.'],
            dataRows: [
                ['title 1', 'some value']
            ],
            getAllCategories: undefined,
            asCollection: true,
            errorMessage: `No subcategory name after the dot symbol in header field: 'Title.'`
        },
        {
            testname: "validateCategories test - subcategory name is only whitespace",
            header: ['Title', 'Title. .Subsubtitle'],
            dataRows: [
                ['title 1', 'some value']
            ],
            getAllCategories: undefined,
            asCollection: true,
            errorMessage: `No subcategory name after the dot symbol in header field: 'Title. .Subsubtitle'`
        },
        {
            testname: "validateCategories test - duplicate category names, subcategory has the same name as other category",
            header: ['Title', 'Artists', "Artists.Title"],
            dataRows: [
                ['title 1', 'artist 1', "title 1"]
            ],
            getAllCategories: undefined,
            asCollection: true,
            errorMessage: `Header has duplicate values`
        },
    ])("$testname", async ({header, dataRows, getAllCategories, asCollection, errorMessage}) => {
        mockGetAllCategories.mockReturnValue(getAllCategories)

        expect(async () => await validateExcelData(header, dataRows, asCollection, collectionId)).rejects.toThrow(errorMessage)
    })

    test("validateCategories test - don't throw any error", () => {
        expect(async () => await validateExcelData(["Title"], [["title 1"]], true, collectionId)).not.toThrow()
    })

    test.each([
        {
            testname: "prepUploadsDirAndArchiveBuffer test - zipfile is undefined ",
            zipFilePath: undefined, 
            collectionId: collectionId,
            returnValue: {}
        },
        {
            testname: "prepUploadsDirAndArchiveBuffer test - return archiveBuffer and collectionUploadsDir ",
            zipFilePath: "utils/archives/archive.zip", 
            collectionId: collectionId,
            returnValue: {archiveBuffer: expect.any(Object), collectionUploadsDir: expect.any(String)}
        },
    ])("$testname", async ({zipFilePath, collectionId, returnValue}) => {
        const zipFile = zipFilePath ? readArchive(path.join(__dirname, zipFilePath)) : undefined

        expect(await prepUploadsDirAndArchiveBuffer(zipFile, collectionId)).toEqual(returnValue)
    })

    test.each([
        {
            testname: "processArchiveFiles test - no files specified",
            oldRecordId: "68936488200287f547b71f5b",
            filenamesString: undefined,
            zipFilePath: "utils/archives/archive.zip",
            returnValue: {uploadedFilenames: [], uploadedFilesCount: 0, failedUploadsCauses: [], filenamesStringValid: undefined}
        },
        {
            testname: "processArchiveFiles test - no zipfile provided",
            oldRecordId: "68936488200287f547b71f5b",
            filenamesString: "0:filename.mid;1:music.mp3;2:text.txt",
            zipFilePath: undefined,
            returnValue: {uploadedFilenames: [], uploadedFilesCount: 0, failedUploadsCauses: [], filenamesStringValid: true}
        },
        {
            testname: "processArchiveFiles test - processing successful",
            oldRecordId: "68936488200287f547b71f5b",
            filenamesString: "0:filename.mid;1:music.mp3;2:text.txt",
            zipFilePath: "utils/archives/archive.zip",
            returnValue: {uploadedFilenames: [
                "68936488200287f547b71f5b_0.mid",
                "68936488200287f547b71f5b_1.mp3",
                "68936488200287f547b71f5b_2.txt"
            ], uploadedFilesCount: 3, failedUploadsCauses: [], filenamesStringValid: true}
        },
        {
            testname: "processArchiveFiles test - some files are not present in the archive",
            oldRecordId: "68936488200287f547b71f5b",
            filenamesString: "0:filename.mid;3:music.mp3;",
            zipFilePath: "utils/archives/archive.zip",
            returnValue: {
                uploadedFilenames: [
                    "68936488200287f547b71f5b_0.mid"
                ],
                uploadedFilesCount: 1,
                failedUploadsCauses: [
                    {
                        archiveFilename: "68936488200287f547b71f5b_3.mp3",
                        cause: "File not found in the archive", userFilename: "music.mp3",
                    }
                ],
                filenamesStringValid: true
            }
        },
        {
            testname: "processArchiveFiles test - failed uploads of file with wrong extension and of file with too large size",
            oldRecordId: "68936488200287f547b71f5b",
            filenamesString: "0:filename.mid;3:pdf_file.pdf;4:large_file.txt",
            zipFilePath: "utils/archives/archive.zip",
            returnValue: {
                uploadedFilenames: [
                    "68936488200287f547b71f5b_0.mid"
                ],
                uploadedFilesCount: 1,
                failedUploadsCauses: [
                    {
                        archiveFilename: "68936488200287f547b71f5b_3.pdf",
                        cause: "Invalid file extension", userFilename: "pdf_file.pdf",
                    },
                    {
                        archiveFilename: "68936488200287f547b71f5b_4.txt",
                        cause: "File size exceeded", userFilename: "large_file.txt",
                    },
                ],
                filenamesStringValid: true
            }
        },
        {
            testname: "processArchiveFiles test - incorrect filenames string (no file indices)",
            oldRecordId: "68936488200287f547b71f5b",
            filenamesString: "filename.txt;music.mp3",
            zipFilePath: "utils/archives/archive.zip",
            returnValue: {uploadedFilenames: [], uploadedFilesCount: 0, failedUploadsCauses: [], filenamesStringValid: false}
        },
        {
            testname: "processArchiveFiles test - incorrect filenames string (file indices are not numbers between 0 and 4)",
            oldRecordId: "68936488200287f547b71f5b",
            filenamesString: "5:filename.txt;6:music.mp3",
            zipFilePath: "utils/archives/archive.zip",
            returnValue: {uploadedFilenames: [], uploadedFilesCount: 0, failedUploadsCauses: [], filenamesStringValid: false}
        },
    ])("$testname", async ({oldRecordId, filenamesString, zipFilePath, returnValue}) => {
        const newRecord = {
            _id: new mongoose.Types.ObjectId(newRecordId),
            categories: [],
            collectionName: 'collection name',
            files: []
        }
        const zipFile = zipFilePath ? readArchive(path.join(__dirname, zipFilePath)) : undefined

        expect(await processArchiveFiles(
            newRecord,
            zipFile ? await unzipper.Open.buffer(zipFile!.buffer) : undefined,
            oldRecordId,
            newRecordId,
            filenamesString,
            "C:\\fake_file_uploads_path",
            collectionId,
            zipFile
        )).toStrictEqual(returnValue)
    })

    // test.each([
    //     {
    //         testName: 'prepRecords test - three levels deep data',
    //         data: [
    //             ['Title', 'Title.Subtitle', 'Title.Subtitle.Subsubtitle', 'Artists'],
    //             ['title 1', 'subtitle 1',
    //             'subsubtitle 1'],
    //         ],
    //         getAllCategories: ['Title', 'Title.Subtitle', 'Title.Subtitle.Subsubtitle', 'Artists']
    //     },
    //     {
    //         testName: 'prepRecords test - unusual column order',
    //         data: [ ['Title.Subtitle', 'Title', 'Title.Subtitle.Subsubtitle'],
    //         ['subtitle 1', 'title 1', 
    //             'subsubtitle 1']],
    //         getAllCategories: ['Title.Subtitle', 'Title', 'Title.Subtitle.Subsubtitle']
    //     },
    //     {
    //         testName: 'prepRecords test - skipped category values in some records',
    //         data: [
    //             ['Title', 'Artists', 'Release Year'],
    //             ['title 1', '', 'release year 1'],
    //             ['', 'artists 2', 'release year 2'],
    //             ['title 3', '', ''],
    //         ],
    //         getAllCategories: ['Title', 'Artists', 'Release Year']
    //     },
    //     {
    //         testName: 'prepRecords test - trim all whitespace category values to empty string',
    //         data: [
    //             ['Title', 'Title.Subtitle', 'Artists'],
    //             ['title 1', ' ', ' ',]

    //         ],
    //         getAllCategories: ['Title', 'Title.Subtitle', 'Artists']
    //     },
    //     {
    //         testName: 'prepRecords test - remove leading/trailing whitespace in each part of full category name',
    //         data: [
    //             [' Title', 'Title . Subtitle ', '  Artists   '],
    //             ['title 1', 'subtitle 1', 'artists 1',]

    //         ],
    //         getAllCategories: ['Title', 'Title.Subtitle', 'Artists']
    //     },
    //     {
    //         testName: 'prepRecords test - remove leading/trailing whitespace in category values',
    //         data: [
    //             ['Title', 'Title.Subtitle', 'Artists'],
    //             ['  title 1   ', '  subtitle 1   ', '    artists 1    ',]

    //         ],
    //         getAllCategories: ['Title', 'Title.Subtitle', 'Artists']
    //     },
    // ])(`$testName`,
    //     async ({data, getAllCategories}) => {
    //         mockGetAllCategories.mockReturnValue(getAllCategories)
    //         expect(await prepRecordsAndFiles(data,
    //             "collection", false, collectionId, undefined
    //         )).toMatchSnapshot()
    //     }
    // )
})