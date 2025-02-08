import {describe, expect, test, jest, beforeEach} from "@jest/globals"
import { getAllCategories, hasValidCategoryFormat, artworkCategoriesHaveValidFormat } from "../categories"

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
				testName: 'artworkCategoriesHaveValidFormat test - return false when collection and artwork category arrays are empty',
				collectionCategories: [],
				artworkCategories: [],
				returnValue: false
			},
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
				testName: 'artworkCategoriesHaveValidFormat test - return false when category object is missing in artwork categories array',
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
				testName: 'artworkCategoriesHaveValidFormat test - return false when category object is missing in artwork subcategories array',
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
						testName: 'getAllCategories test - categories present in collection',
						categories: [
							{name: "Tytuł", subcategories: [
								{name: "Podtytuł", subcategories: [{name: "Podpodtytuł", subcategories: []}]},
								{name: "Podtytuł alternatywny", subcategories: []},
							]},
							{name: "Artyści", subcategories: []},
							{name: "Rok", subcategories: [{name: "Miesiąc", subcategories: [{name: "Dzień", subcategories: []}]}]}
						],
				},
				{
						testName: 'getAllCategories test - no categories in collection',
						categories: []
				},
		])(`$testName`,
				async ({categories}) => {
						mockCollectionFind.mockImplementation(() => {return {exec: () => Promise.resolve([
								{
										_id: "6717d46c666e8575d873ee57",
										name: 'collection',
										description: 'collection description',
										categories: categories,
										__v: 0
								}
						])}})
		
						expect(await getAllCategories("collection")).toMatchSnapshot();
				}
		)

		test.each([
				{
						testName: 'getAllCategories test - throw error when collection not found',
						collectionFind: () => {return {exec: () => Promise.resolve([])}},
						error: "Collection not found"
				},
				{
						testName: 'getAllCategories test - Collection.find() throws error',
						collectionFind: () => {throw Error()},
						error: "Database unavailable"
				}
		])(`$testName`,
				async ({collectionFind, error}) => {
						mockCollectionFind.mockImplementation(collectionFind)

						expect(() => getAllCategories("collection")).rejects.toThrow(error);
				}
		)
})