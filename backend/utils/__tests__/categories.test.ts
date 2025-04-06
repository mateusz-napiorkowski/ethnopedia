import {describe, expect, test, jest, beforeEach} from "@jest/globals"
import { getAllCategories, hasValidCategoryFormat, artworkCategoriesHaveValidFormat, transformCategoriesArrayToCategoriesObject, findMissingParentCategories } from "../categories"

const mockCollectionFind = jest.fn()
jest.mock('../../models/collection', () => ({
		find: () => mockCollectionFind()
}))

const collectionName = 'collection'
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
					{name: "Tytuł", value: "example title", subcategories: []},
					{name: "Rok", value: "1999", subcategories: []}
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
					{name: "Tytuł", value: "example title", subcategories: [
						{name: "Podtytuł", value: "example subtitle", subcategories: [
							{name: "Podpodtytuł", value: "example subsubtitle", subcategories: []},
							{name: "Podpodtytuł inny", value: "alternative subsubtitle", subcategories: []},
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
					{name: "Rok", value: "1999", subcategories: []},
					{name: "Tytuł", value: "example title", subcategories: []}
					
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
					{name: "Tytuł", value: "example title", subcategories: [
						{name: "Podtytuł", value: "example subtitle", subcategories: [
							{name: "Podpodtytuł alternatywny", value: "alternative subsubtitle", subcategories: []},
							{name: "Podpodtytuł", value: "example subsubtitle", subcategories: []}
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
					{name: "Tytuł", value: "example title", subcategories: []}
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
					{name: "Tytuł", value: "example title", subcategories: [
						{name: "Podtytuł", value: "example subtitle", subcategories: [
							{name: "Podpodtytuł alternatywny", value: "alternative subsubtitle", subcategories: []},
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
					{name: "Tytuł", value: "example title", subcategories: [
						{name: "Podtytuł", value: "subtitle", subcategories: [{name: "Podpodtytuł", value: "subsubtitle", subcategories: []}]},
						{name: "Podtytuł alternatywny", value: "alternative subtitle", subcategories: []},
					]},
					{name: "Rok", value: "1999", subcategories: [{name: "Miesiąc", value: "styczeń", subcategories: [{name: "Dzień", value: "3", subcategories: []}]}]}
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
										name: collectionName,
										description: 'collection description',
										categories: categories,
										__v: 0
								}
						])}})
		
						expect(await getAllCategories(collectionName)).toMatchSnapshot();
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

						expect(() => getAllCategories(collectionName)).rejects.toThrow(error);
				}
		)

		test.each([
			{
				testName: 'transformCategoriesArrayToCategoriesObject test - return correct category object when there are no nested subcategories',
				categoryData: ["Tytuł", "Artyści", "Rok"],
				returnValue: [
					{name: "Tytuł", subcategories: []},
					{name: "Artyści", subcategories: []},
					{name: "Rok", subcategories: []}
				]
			},
			{
				testName: 'transformCategoriesArrayToCategoriesObject test - return correct category object when there are nested subcategories and categories are arranged in an ambiguous order',
				categoryData: ["Tytuł.Podtytuł.Podpodtytuł", "Tytuł", "Tytuł.Podtytuł", "Rok.Miesiąc.Dzień", "Artyści", "Tytuł.Podtytuł alternatywny", "Rok", "Rok.Miesiąc"],
				returnValue: [
					{name: "Tytuł", subcategories: [
						{name: "Podtytuł", subcategories: [{name: "Podpodtytuł", subcategories: []}]},
						{name: "Podtytuł alternatywny", subcategories: []},
					]},
					{name: "Artyści", subcategories: []},
					{name: "Rok", subcategories: [{name: "Miesiąc", subcategories: [{name: "Dzień", subcategories: []}]}]}
				]
			},
		])(`$testName`,
				({categoryData, returnValue}) => {
					expect(transformCategoriesArrayToCategoriesObject(categoryData)).toEqual(returnValue)
				}
		)

		test.each([
			{
				testName: 'findMissingParentCategories test - no subcategories',
				categoryData: ["Tytuł", "Artyści", "Rok"],
				returnValue: []
			},
			{
				testName: 'findMissingParentCategories test - correct subcategory names',
				categoryData: ["Rok.Miesiąc.Dzień", "Tytuł", "Rok.Miesiąc", "Artyści", "Rok", "Tytuł.Podtytuł"],
				returnValue: []
			},
			{
				testName: 'findMissingParentCategories test - correct subcategory names',
				categoryData: ["Rok.Miesiąc.Dzień", "Tytuł", "Tytuł.Podtytuł.Podpodpodtytuł.Podpodpodtytuł", "Rok.Miesiąc", "Artyści", "Tytuł.Podtytuł"],
				returnValue: ["Tytuł.Podtytuł.Podpodpodtytuł", "Rok"]
			},
		])(`$testName`,
				({categoryData, returnValue}) => {
					expect(findMissingParentCategories(categoryData)).toEqual(returnValue)
				}
		)		
})