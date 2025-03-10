import {describe, expect, test, jest, beforeEach} from "@jest/globals"
import { fillRow } from "../data-export";

describe('data-export util functions tests', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    test.each([
        {
            testName: 'fillRow test - functions returns correct data',
            keys: [
                'Tytuł',
                'Tytuł.Podtytuł',
                'Tytuł.Podtytuł.Podpodtytuł',
                'Artyści',
                'Rok',
                'Rok.Miesiąc',
                'Rok.Miesiąc.Dzień',
                'Tytuł.Znaczenie tytułu',
                'Rok.Kwartał',
                'Rok.Kwartał.Miesiąc',
                'Rok.Kwartał.Miesiąc.Dzień'
              ],
            categories: [
                {
                  name: 'Tytuł',
                  value: 'testowy',
                  subcategories: [
                    {
                      name: 'Podtytuł',
                      value: 'podtytuł testowy',
                      subcategories: [ { name: 'Podpodtytuł', value: 'podpodtytuł testowy', subcategories: [] } ]
                    }
                  ]
                },
                { name: 'Artyści', value: 'testowi', subcategories: [] },
                {
                  name: 'Rok',
                  value: '966',
                  subcategories: [
                    {
                      name: 'Miesiąc',
                      value: '12',
                      subcategories: [ { name: 'Dzień', value: '13', subcategories: [] } ]
                    }
                  ]
                }
            ]
        },
    ])(`$testName`,
        async ({keys, categories}) => {
            expect(fillRow(keys, categories)).toMatchSnapshot()
        }
    )
})