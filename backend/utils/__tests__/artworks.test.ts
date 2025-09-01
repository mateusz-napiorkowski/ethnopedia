import {describe, expect, test, jest, beforeEach} from "@jest/globals"
import { constructQuickSearchFilter, constructAdvSearchFilter, sortRecordsByCategory, updateArtworkCategories, constructTopmostCategorySearchTextFilter, handleFileUploads, handleFileDeletions } from "../artworks"
import mongoose, { SortOrder } from "mongoose"
import { collectionIds, collectionNames, session, recordsSortByTytulAsc, recordsSortByTytulDesc, recordsSortByArtysciAsc, recordsNonexistentSortByCategory, recordsNonexistentSortByCategoryOnSomeRecords, recordsSortByCreatedAtOrUpdatedAtCase, artworkId, twoArtworkFiles, fiveFilesToUpload, fiveAddedFiles, twoArtworkFilesWithIndices0and2, twoFilesToUpload, addedArtworkFilesWithIndices1and3, filesToUploadWithErrors, artworkSubcategoriesStructureNotChanged, collectionSubcategoriesStructureNotChanged, artworkSubcategoriesCategoryNamesChanged, collectionSubcategoriesCategoryNamesChanged, artworkSubcategoriesNewCategoriesAndSubcategories, collectionSubcategoriesNewCategoriesAndSubcategories } from "./utils/consts"
import fs from "fs"

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
			testCase: "empty arrays",
			artworkSubcategories: [],
			collectionSubcategories: []
		},
		{
			testCase: "structure not changed",
			artworkSubcategories: artworkSubcategoriesStructureNotChanged,
			collectionSubcategories: collectionSubcategoriesStructureNotChanged
		},
		{
			testCase: "only category names changed",
			artworkSubcategories: artworkSubcategoriesCategoryNamesChanged,
			collectionSubcategories: collectionSubcategoriesCategoryNamesChanged
		},
		{
			testCase: "new categories and subcategories",
			artworkSubcategories: artworkSubcategoriesNewCategoriesAndSubcategories,
			collectionSubcategories: collectionSubcategoriesNewCategoriesAndSubcategories,
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

					expect(await constructQuickSearchFilter("text to find", collectionIds, collectionNames)).toMatchSnapshot()
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
					expect(await constructAdvSearchFilter(query, collectionNames)).toMatchSnapshot()
			}
	)

	test.each([
		{
			case: "sort by Tytuł asc",
			records: recordsSortByTytulAsc,
			sortBy: "Tytuł",
			order: 'asc'
		},
		{
			case: "sort by Tytuł desc",
			records: recordsSortByTytulDesc,
			sortBy:"Tytuł",
			order: 'desc'
		},
		{
			case: "sort by Artyści asc",
			records: recordsSortByArtysciAsc,
			sortBy: "Artyści",
			order: 'asc'
		},
		{
			case: "nonexistent category to sort by",
			records: recordsNonexistentSortByCategory,
			sortBy: "Nonexistent",
			order: 'asc'
		},
		{
			case: "category to sort records by doesn't exist on some records",
			records: recordsNonexistentSortByCategoryOnSomeRecords,
			sortBy: "Tytuł",
			order: 'asc'
		},
		{
			case: "return unchanged records if categoryToSortBy is createdAt or updatedAt",
			records: recordsSortByCreatedAtOrUpdatedAtCase,
			sortBy: "createdAt",
			order: 'asc'
		},
	])(`sortRecordsByCategory test - $case`,
			async ({records, sortBy, order}) => {
				expect(sortRecordsByCategory(records, sortBy, order as SortOrder)).toMatchSnapshot()
			}
	)

	it.each([
		{
			case: "no files to upload",
			artwork: {
				_id: new mongoose.Types.ObjectId(artworkId),
				files: twoArtworkFiles,
				save: () => {}
			},
			filesToUpload: [],
			collectionId: new mongoose.Types.ObjectId(collectionIds[0]),
			addedArtworkFiles: []
		},
		{
			case: "upload 5 files when artwork doesn't have any associated files",
			artwork: {
				_id: new mongoose.Types.ObjectId(artworkId),
				files: [],
				save: () => {}
			},
			filesToUpload: fiveFilesToUpload,
			collectionId: new mongoose.Types.ObjectId(collectionIds[0]),
			addedArtworkFiles: fiveAddedFiles		
		},
		{
			case: "upload two files when artwork has two associated files with indices 0 and 2",
			artwork: {
				_id: new mongoose.Types.ObjectId(artworkId),
				files: twoArtworkFilesWithIndices0and2,
				save: () => {}
			},
			filesToUpload: twoFilesToUpload,
			collectionId: new mongoose.Types.ObjectId(collectionIds[0]),
			addedArtworkFiles: addedArtworkFilesWithIndices1and3	
		},
		{
			case: "upload of 2 out of 4 files fails - one file has inapropriate extension and another has maximal size exceeded",
			artwork: {
				_id: new mongoose.Types.ObjectId(artworkId),
				files: [],
				save: () => {}
			},
			filesToUpload: filesToUploadWithErrors,
			collectionId: new mongoose.Types.ObjectId(collectionIds[0]),
			addedArtworkFiles: twoArtworkFiles
		},			
	])("handleFileUploads test - $case",
		async ({artwork, filesToUpload, collectionId, addedArtworkFiles}) => {
			const pushSpy = jest.spyOn(artwork.files, 'push');
			expect(await handleFileUploads(artwork, filesToUpload, collectionId, session)).toMatchSnapshot()
			if(addedArtworkFiles)
				for(const [n, value] of addedArtworkFiles.entries())
					expect(pushSpy).toHaveBeenNthCalledWith(n+1, addedArtworkFiles[n])		
		}
	)

	it.each([
		{
			case: "no files to delete",
			artwork: {
				_id: new mongoose.Types.ObjectId(artworkId),
				files: [],
				save: () => {}
			},
			filesToDelete: [],
			collectionId: new mongoose.Types.ObjectId(collectionIds[0]),
			fsExistsSync: true
		},
		{
			case: "file to delete not found",
			artwork: {
				_id: new mongoose.Types.ObjectId(artworkId),
				files: [],
				save: () => {}
			},
			filesToDelete: [
				{	
					originalFilename: "lyrics.mei",
					filePath: `/uploads/${collectionIds[0]}/${artworkId}_0.mei`,
					size: expect.any(Number) as unknown as number,
					uploadedAt: expect.any(Date) as unknown as Date,
					_id: expect.any(String) as unknown as string}
				],
			collectionId: new mongoose.Types.ObjectId(collectionIds[0]),
			fsExistsSync: true
		},
		{
			case: "one file to delete",
			artwork: {
				_id: new mongoose.Types.ObjectId(artworkId),
				files: [
					{
						originalFilename: 'lyrics.mei',
						newFilename: `${artworkId}_0.mei`,
						filePath: `/uploads/${collectionIds[0]}/${artworkId}_0.mei`,
						size: 8444,
						uploadedAt: new Date('2024-10-23T12:57:35.366Z'),
						_id: "6897a16dce55abb5265e658e"
					},
				],
				save: () => {}
			},
			filesToDelete: [
				{	
					originalFilename: "lyrics.mei",
					filePath: `/uploads/${collectionIds[0]}/${artworkId}_0.mei`,
					size: 8444,
					uploadedAt: new Date('2024-10-23T12:57:35.366Z'),
					_id: "6897a16dce55abb5265e658e"
				}
			],
			collectionId: new mongoose.Types.ObjectId(collectionIds[0]),
			fsExistsSync: true
		},
		{
			case: "file to delete with given filepath doesn't exist",
			artwork: {
				_id: new mongoose.Types.ObjectId(artworkId),
				files: [
					{
						originalFilename: 'lyrics.mei',
						newFilename: `${artworkId}_0.mei`,
						filePath: `/uploads/${collectionIds[0]}/${artworkId}_0.mei`,
						size: 8444,
						uploadedAt: new Date('2024-10-23T12:57:35.366Z'),
						_id: "6897a16dce55abb5265e658e"
					},
				],
				save: () => {}
			},
			filesToDelete: [
				{	
					originalFilename: "lyrics.mei",
					filePath: `/uploads/${collectionIds[0]}/${artworkId}_0.mei`,
					size: 8444,
					uploadedAt: new Date('2024-10-23T12:57:35.366Z'),
					_id: "6897a16dce55abb5265e658e"
				}
			],
			collectionId: new mongoose.Types.ObjectId(collectionIds[0]),
			fsExistsSync: false
		},			
	])("handleFileDeletions test - $case",
		async ({artwork, filesToDelete, fsExistsSync}) => {
			const existsSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(fsExistsSync);
			expect(await handleFileDeletions(artwork, filesToDelete, session)).toMatchSnapshot()
			existsSpy.mockRestore();
		}
	)
})