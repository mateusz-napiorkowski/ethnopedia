import {describe, expect, test, jest, beforeEach} from "@jest/globals"
import { getAllCategories, hasValidCategoryFormat, artworkCategoriesHaveValidFormat } from "../categories"

const mockArtworkFind = jest.fn()
jest.mock('../../models/artwork', () => ({
		find: () => mockArtworkFind()
}))

const mockCollectionFind = jest.fn()
jest.mock('../../models/collection', () => ({
		find: () => mockCollectionFind()
}))

describe('categories util functions tests', () => {
		beforeEach(() => {
				jest.resetAllMocks()
		})

		test.each([
			{
				testName: 'hasValidCategoryFormat test - return false when no categories in array',
				categoryData: [],
				returnValue: false
			},
			{
					testName: 'hasValidCategoryFormat test - return false when subcategories are missing',
					categoryData: [{name: "Tytuł", subcategories: []}, {name: "Artyści"}],
					returnValue: false
			},
			{
				testName: 'hasValidCategoryFormat test - return false when name is missing',
				categoryData: [{subcategories: [{name: "Podtytuł", subcategories: []}]}, {name: "Artyści", subcategories: []}],
				returnValue: false
			},
			{
				testName: 'hasValidCategoryFormat test - return false when subcategories are missing in nested subcategory array',
				categoryData: [
					{name: "Tytuł", subcategories: [{name: "Podtytuł", subcategories: [{name: "Podpodtytuł"}]}]},
					{name: "Rok", subcategories: [{name: "Miesiąc", subcategories: [{name: "Dzień", subcategories: []}]}]}
				],
				returnValue: false
			},
			{
				testName: 'hasValidCategoryFormat test - return false when name is missing in nested subcategory array',
				categoryData: [
					{name: "Tytuł", subcategories: [{name: "Podtytuł", subcategories: [{name: "Podpodtytuł", subcategories: []}]}]},
					{name: "Rok", subcategories: [{name: "Miesiąc", subcategories: [{subcategories: []}]}]}
				],
				returnValue: false
			},
			{
				testName: 'hasValidCategoryFormat test - return true when category data format is correct',
				categoryData: [
					{name: "Tytuł", subcategories: [
						{name: "Podtytuł", subcategories: [{name: "Podpodtytuł", subcategories: []}]},
						{name: "Podtytuł alternatywny", subcategories: []},
					]},
					{name: "Rok", subcategories: [{name: "Miesiąc", subcategories: [{name: "Dzień", subcategories: []}]}]}
				],
				returnValue: true
			},
		])(`$testName`,
				({categoryData, returnValue}) => {
					expect(hasValidCategoryFormat(categoryData)).toBe(returnValue)
				}
		)

		test.each([
			{
				testName: 'artworkCategoriesHaveValidFormat test - return false when collection and artwork category names do not match',
				collectionCategories: [
					{name: "Tytuł", subcategories: []},
					{name: "Artyści", subcategories: []}
				],
				artworkCategories: [
					{name: "Tytuł", values: ["example title"], subcategories: []},
					{name: "Rok", values: ["1999"], subcategories: []}
				],
				returnValue: false
			},
			{
				testName: 'artworkCategoriesHaveValidFormat test - return false when collection and artwork subcategory names do not match',
				collectionCategories: [
					{name: "Tytuł", subcategories: [
						{name: "Podtytuł", subcategories: [
							{name: "Podpodtytuł", subcategories: []},
							{name: "Podpodtytuł alternatywny", subcategories: []},
						]}
					]},
				],
				artworkCategories: [
					{name: "Tytuł", values: ["example title"], subcategories: [
						{name: "Podtytuł", values: ["example subtitle"], subcategories: [
							{name: "Podpodtytuł", values: ["example subsubtitle"], subcategories: []},
							{name: "Podpodtytuł inny", values: ["alternative subsubtitle"], subcategories: []},
						]}
					]},
				],
				returnValue: false
			},
			{
				testName: 'artworkCategoriesHaveValidFormat test - return false when collection and artwork categories do not follow the same order',
				collectionCategories: [
					{name: "Tytuł", subcategories: []},
					{name: "Rok", subcategories: []}
				],
				artworkCategories: [
					{name: "Rok", values: ["1999"], subcategories: []},
					{name: "Tytuł", values: ["example title"], subcategories: []}
					
				],
				returnValue: false
			},
			{
				testName: 'artworkCategoriesHaveValidFormat test - return false when collection and artwork subcategories do not follow the same order',
				collectionCategories: [
					{name: "Tytuł", subcategories: [
						{name: "Podtytuł", subcategories: [
							{name: "Podpodtytuł", subcategories: []},
							{name: "Podpodtytuł alternatywny", subcategories: []},
						]}
					]},
				],
				artworkCategories: [
					{name: "Tytuł", values: ["example title"], subcategories: [
						{name: "Podtytuł", values: ["example subtitle"], subcategories: [
							{name: "Podpodtytuł alternatywny", values: ["alternative subsubtitle"], subcategories: []},
							{name: "Podpodtytuł", values: ["example subsubtitle"], subcategories: []}
						]}
					]},
				],
				returnValue: false
			},
			{
				testName: 'artworkCategoriesHaveValidFormat test - return false when category object is missing artwork categories array',
				collectionCategories: [
					{name: "Tytuł", subcategories: []},
					{name: "Artyści", subcategories: []}
				],
				artworkCategories: [
					{name: "Tytuł", values: ["example title"], subcategories: []}
				],
				returnValue: false
			},
			{
				testName: 'artworkCategoriesHaveValidFormat test - return false when category object is missing artwork subcategories array',
				collectionCategories: [
					{name: "Tytuł", subcategories: [
						{name: "Podtytuł", subcategories: [
							{name: "Podpodtytuł", subcategories: []},
							{name: "Podpodtytuł alternatywny", subcategories: []},
						]}
					]},
				],
				artworkCategories: [
					{name: "Tytuł", values: ["example title"], subcategories: [
						{name: "Podtytuł", values: ["example subtitle"], subcategories: [
							{name: "Podpodtytuł alternatywny", values: ["alternative subsubtitle"], subcategories: []},
						]}
					]},
				],
				returnValue: false
			},
			{
				testName: 'artworkCategoriesHaveValidFormat test - return false when name proprerty is missing in artwork categories',
				collectionCategories: [
					{name: "Tytuł", subcategories: []},
					{name: "Rok", subcategories: []}
				],
				artworkCategories: [
					{name: "Tytuł", values: ["example title"], subcategories: []},
					{values: ["1999"], subcategories: []}
				],
				returnValue: false
			},
			{
				testName: 'artworkCategoriesHaveValidFormat test - return false when name proprerty is missing in artwork subcategories',
				collectionCategories: [
					{name: "Tytuł", subcategories: [
						{name: "Podtytuł", subcategories: [
							{name: "Podpodtytuł", subcategories: []},
							{name: "Podpodtytuł alternatywny", subcategories: []},
						]}
					]},
				],
				artworkCategories: [
					{name: "Tytuł", values: ["example title"], subcategories: [
						{name: "Podtytuł", values: ["example subtitle"], subcategories: [
							{name: "Podpodtytuł", values: ["example subsubtitle"], subcategories: []},
							{values: ["alternative subsubtitle"], subcategories: []},
						]}
					]},
				],
				returnValue: false
			},
			{
				testName: 'artworkCategoriesHaveValidFormat test - return false when values proprerty is missing in artwork categories',
				collectionCategories: [
					{name: "Tytuł", subcategories: []},
					{name: "Rok", subcategories: []}
				],
				artworkCategories: [
					{name: "Tytuł", values: ["example title"], subcategories: []},
					{name: "Rok", subcategories: []}
				],
				returnValue: false
			},
			{
				testName: 'artworkCategoriesHaveValidFormat test - return false when values proprerty is missing in artwork subcategories',
				collectionCategories: [
					{name: "Tytuł", subcategories: [
						{name: "Podtytuł", subcategories: [
							{name: "Podpodtytuł", subcategories: []},
							{name: "Podpodtytuł alternatywny", subcategories: []},
						]}
					]},
				],
				artworkCategories: [
					{name: "Tytuł", values: ["example title"], subcategories: [
						{name: "Podtytuł", values: ["example subtitle"], subcategories: [
							{name: "Podpodtytuł", values: ["example subsubtitle"], subcategories: []},
							{name: "Podpodtytuł alternatywny", subcategories: []},
						]}
					]},
				],
				returnValue: false
			},
			{
				testName: 'artworkCategoriesHaveValidFormat test - return false when subcategories proprerty is missing in artwork categories',
				collectionCategories: [
					{name: "Tytuł", subcategories: []},
					{name: "Rok", subcategories: []}
				],
				artworkCategories: [
					{name: "Tytuł", values: ["example title"], subcategories: []},
					{name: "Rok", values: ["1999"], }
				],
				returnValue: false
			},
			{
				testName: 'artworkCategoriesHaveValidFormat test - return false when subcategories proprerty is missing in artwork subcategories',
				collectionCategories: [
					{name: "Tytuł", subcategories: [
						{name: "Podtytuł", subcategories: [
							{name: "Podpodtytuł", subcategories: []},
							{name: "Podpodtytuł alternatywny", subcategories: []},
						]}
					]},
				],
				artworkCategories: [
					{name: "Tytuł", values: ["example title"], subcategories: [
						{name: "Podtytuł", values: ["example subtitle"], subcategories: [
							{name: "Podpodtytuł", values: ["example subsubtitle"], subcategories: []},
							{name: "Podpodtytuł alternatywny", values: ["alternative subsubtitle"]},
						]}
					]},
				],
				returnValue: false
			},
			{
				testName: 'artworkCategoriesHaveValidFormat test - return true when collection and artwork categories match',
				collectionCategories: [
					{name: "Tytuł", subcategories: [
						{name: "Podtytuł", subcategories: [{name: "Podpodtytuł", subcategories: []}]},
						{name: "Podtytuł alternatywny", subcategories: []},
					]},
					{name: "Rok", subcategories: [{name: "Miesiąc", subcategories: [{name: "Dzień", subcategories: []}]}]}
				],
				artworkCategories: [
					{name: "Tytuł", values: ["example title"], subcategories: [
						{name: "Podtytuł", values: ["subtitle"], subcategories: [{name: "Podpodtytuł", values: ["subsubtitle"], subcategories: []}]},
						{name: "Podtytuł alternatywny", values: ["alternative subtitle"], subcategories: []},
					]},
					{name: "Rok", values: ["1999"], subcategories: [{name: "Miesiąc", values: ["styczeń"], subcategories: [{name: "Dzień", values: ["3"], subcategories: []}]}]}
				],
				returnValue: true
			},
		])(`$testName`,
				({collectionCategories, artworkCategories, returnValue}) => {
					expect(artworkCategoriesHaveValidFormat(artworkCategories, collectionCategories)).toBe(returnValue)
				}
		)

		test.each([
				{
						testName: 'getAllColletions test - artworks present in collection',
						artworkFind: () => {return {exec: () => Promise.resolve([
								{
									_id: "6717d4c0666e8575d873ee69",
									createdAt: '2024-10-22T20:12:12.209Z',
									updatedAt: '2024-10-22T20:12:12.209Z',
									__v: 0,
									categories: [
										{
											name: 'Tytuł',
											values: [ 'testowy' ],
											subcategories: [
												{
													name: 'Podtytuł',
													values: [ 'podtytuł testowy' ],
													subcategories: [
														{
															name: 'Podpodtytuł',
															values: [ 'podpodtytuł testowy' ]
														}
													]
												}
											]
										},
										{ name: 'Artyści', values: [ 'testowi' ], subcategories: [] },
										{
											name: 'Rok',
											values: [ '966' ],
											subcategories: [
												{
													name: 'Miesiąc',
													values: [ '12' ],
													subcategories: [ { name: 'Dzień', values: [ '13' ] } ]
												}
											]
										}
									],
									collectionName: 'collection'
								},
								{
									_id: "6718078ad4821e244dd54b84",
									createdAt: '2024-10-22T20:14:13.773Z',
									updatedAt: '2024-10-22T20:14:13.773Z',
									__v: 0,
									categories: [
										{
											name: 'Tytuł',
											values: [ 'testowy 2' ],
											subcategories: [ { name: 'Znaczenie tytułu', values: [ 'testowe' ] } ]
										},
										{
											name: 'Artyści',
											values: [ 'artysta testowy' ],
											subcategories: []
										},
										{
											name: 'Rok',
											values: [ '955' ],
											subcategories: [
												{
													name: 'Kwartał',
													values: [ 'III' ],
													subcategories: [
														{
															name: 'Miesiąc',
															values: [ 'Wrzesień' ],
															subcategories: [ { name: 'Dzień', values: [ '1' ] } ]
														}
													]
												}
											]
										}
									],
									collectionName: 'collection'
								}
							])}},
				},
				{
						testName: 'getAllColletions test - no artworks in collection',
						artworkFind: () => {return {exec: () => Promise.resolve([])}},
				},
		])(`$testName`,
				async ({artworkFind}) => {
						mockCollectionFind.mockImplementation(() => {return {exec: () => Promise.resolve([
								{
										_id: "6717d46c666e8575d873ee57",
										name: 'collection',
										description: 'collection description',
										__v: 0
								}
						])}})
						mockArtworkFind.mockImplementation(artworkFind)
		
						expect(await getAllCategories("collection")).toMatchSnapshot();
				}
		)

		test.each([
				{
						testName: 'getAllColletions test - throw error when collection not found',
						collectionFind: () => {return {exec: () => Promise.resolve([])}},
						artworkFind: () => {},
						error: "Collection not found"
				},
				{
						testName: 'getAllColletions test - Collection.find() throws error',
						collectionFind: () => {throw Error()},
						artworkFind: () => {},
						error: "Database unavailable"
				},
				{
						testName: 'getAllColletions test - Artwork.find() throws error',
						collectionFind: () => {return {exec: () => Promise.resolve([
								{
										_id: "6717d46c666e8575d873ee57",
										name: 'collection',
										description: 'collection description',
										__v: 0
								}
								])}},
						artworkFind: () => {throw Error()},
						error: "Database unavailable"
				},
		])(`$testName`,
				async ({collectionFind, artworkFind, error}) => {
						mockCollectionFind.mockImplementation(collectionFind)
						mockArtworkFind.mockImplementation(artworkFind)

						expect(() => getAllCategories("collection")).rejects.toThrow(error);
				}
		)
})