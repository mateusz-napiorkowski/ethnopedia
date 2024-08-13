import {addTwoNumbers} from "../../controllers/artworks"
import { describe, test, expect } from "@jest/globals"

describe('Sum function', () =>{
    test('Returns correct value', () =>{
        expect(addTwoNumbers(2,3)).toEqual(5)
    })
})