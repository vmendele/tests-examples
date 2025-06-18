import { describe, test, type TestContext } from "node:test"
import { divide } from "../../src/divide.ts"

describe("calc", () => {
    test("should be able to divide two numbers", (t: TestContext) => {
        // Given
        // When
        // Then
        t.assert.strictEqual(divide(20, 5), 4)
    })

    test("should not be able to divide by 0", (t: TestContext) => {
        // Given
        // When
        // Then
        t.assert.throws(() => divide(20, 0), new Error("Cannot divide by 0"))
    })
})