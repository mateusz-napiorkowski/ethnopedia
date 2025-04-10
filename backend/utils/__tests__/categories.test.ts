import {describe, expect, test, jest, beforeEach} from "@jest/globals"
import { getAllCategories, hasValidCategoryFormat, artworkCategoriesHaveValidFormat, transformCategoriesArrayToCategoriesObject, findMissingParentCategories, isValidCollectionCategoryStructureForCollectionUpdate } from "../categories"

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
				testCase: "empty arrays",
				artworkSubcategories: [],
				collectionSubcategories: [],
				returnValue: true
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
				],
				returnValue: true
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
				],
				returnValue: true
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
				returnValue: true
			  },
			  {
				testCase: "less categories in collection than in artwork",
				artworkSubcategories: [
				  {name: "Rok", value: "1999", subcategories: []},
				  {name: "Wykonawca", value: "Jan Kowalski", subcategories: []}
				],
				collectionSubcategories: [
				  {name: "Rok", subcategories: []}
				],
				returnValue: false
			  },
			  {
				testCase: "less subcategories in collection than in artwork",
				artworkSubcategories: [
				  {name: "Region", value: "Mazowsze", subcategories: [
					{name: "Podregion", value: "Mazowsze południowe", subcategories: []},
					{name: "Jakaś kategoria", value: "Wartość", subcategories: []},
				  ]}
				],
				collectionSubcategories: [
				  {name: "Region", subcategories: [
					{name: "Podregion", subcategories: []}
				  ]}
				],
				returnValue: false
			  },
			  {
				testCase: "less subcategories in collection than in artwork - artwork subcategiories have more levels",
				artworkSubcategories: [
				  {name: "Region", value: "Mazowsze", subcategories: [
					{name: "Podregion", value: "Mazowsze południowe", subcategories: [
					  {name: "Podpodregion", value: "Wartość podpodregionu", subcategories: []}
					]},
				  ]}
				],
				collectionSubcategories: [
				  {name: "Region", subcategories: [
					{name: "Podregion", subcategories: []}
				  ]}
				],
				returnValue: false
			  },
			])("isValidCollectionCategoryStructureForCollectionUpdate - $testCase", ({artworkSubcategories, collectionSubcategories, returnValue}) => {
			  expect(isValidCollectionCategoryStructureForCollectionUpdate(artworkSubcategories, collectionSubcategories)).toBe(returnValue)
			})

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