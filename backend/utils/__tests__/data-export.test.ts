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
                  values: [ 'testowy' ],
                  subcategories: [
                    {
                      name: 'Podtytuł',
                      values: [ 'podtytuł testowy' ],
                      subcategories: [ { name: 'Podpodtytuł', values: [ 'podpodtytuł testowy' ], subcategories: [] } ]
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
                      subcategories: [ { name: 'Dzień', values: [ '13' ], subcategories: [] } ]
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