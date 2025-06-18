import { loadConfig } from "../../../src/mocking-file-system/load-config.ts"
import { describe, test, type TestContext } from "node:test"
import { FakeFileSystem } from "./fake-file-system.ts"


describe("loadConfig", () => {
    test("should be able to load a JSON config from file", async (t: TestContext) => {
        // Given
        const fileSystem = new FakeFileSystem()
            .mockFile("config.json", `{ "foo": "bar" }`)

        // When
        // Then
        t.assert.deepStrictEqual(await loadConfig("config.json", fileSystem), { foo: "bar" })
    })

    test("should not be able to load the config given the file doesn't exist", async (t: TestContext) => {
        // Given
        const fileSystem = new FakeFileSystem()

        // When
        // Then
        await t.assert.rejects(loadConfig("config.json", fileSystem), new Error("ENOENT: no such file or directory, open 'config.json'"))
    })

    test("should not be able to load the config given the file is not a json", async (t: TestContext) => {
        // Given
        const fileSystem = new FakeFileSystem()
            .mockFile("config.yaml", "foo: 1")

        // When
        // Then
        await t.assert.rejects(loadConfig("config.yaml", fileSystem), new SyntaxError("Unexpected token 'o', \"foo: 1\" is not valid JSON"))
    })
})