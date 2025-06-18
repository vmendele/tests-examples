// Cet exemple démontre comment utilise `testcontainers` pour démarrer 
// un serveur HTTP de mock.
// 
// Le serveur HTTP de mock utilisé est `wiremock`, mais il en existe 
// d'autres tel que `mockserver`.
//
// Peut importe le serveur utilisé, le principe reste le même :
// 1. démarrer le serveur
// 2. configurer les fausses routes avec un client
// 3. exécuter le code testé
import { describe, test, type TestContext, before, after } from "node:test"
import { GenericContainer, type StartedTestContainer } from "testcontainers"
import { WireMock } from "wiremock-captain"
import { getUserFactory } from "../../../src/testing-third-party-services/get-user.ts"
import { randomUUID } from "node:crypto"

describe("getUser", () => {
    let wiremock!: StartedTestContainer
    let baseUrl!: string
    let client!: WireMock

    before(async () => {
        // Une seule instance de wiremock est démarrée pour tous les tests.
        wiremock = await new GenericContainer("wiremock/wiremock:latest")
            .withExposedPorts(8080)
            .start()

        baseUrl = `http://${wiremock.getHost()}:${wiremock.getFirstMappedPort()}`
        client = new WireMock(baseUrl)
    })

    after(async () => {
        await wiremock?.stop()
    })


    test("should be able to fetch a user by its ID", async (t: TestContext) => {
        // Given
        // Chaque test utilise un prefix d'URL aléatoire pour être isolé.
        const testId = randomUUID()
        const testBaseUrl = `${baseUrl}/${testId}`
        // `getUser` point sur `testBaseUrl`, c'est-à-dire un faux serveur HTTP.
        const getUser = getUserFactory(testBaseUrl)

        // Wiremock va répondres aux requêtes dont l'URL est `/${testId}/users/1`
        // avec une 200 et le body spécifié.
        const mock = await client.register({
            method: "GET",
            endpoint: `/${testId}/users/1`,
        }, {
            status: 200,
            body: { email: "foo@bar.com", id: "1" }
        })

        t.after(() => client.deleteMapping(mock.id))

        // When
        // Then
        t.assert.deepStrictEqual(await getUser("1"), { email: "foo@bar.com", id: "1" })
    })

    test("should be able to handle a 404", async (t: TestContext) => {
        // Given
        const testId = randomUUID()
        const testBaseUrl = `${baseUrl}/${testId}`
        const getUser = getUserFactory(testBaseUrl)

        const mock = await client.register({
            method: "GET",
            endpoint: `/${testId}/users/1`,
        }, {
            status: 404,
            body: { msg: "Not found" }
        })

        t.after(() => client.deleteMapping(mock.id))

        // When
        // Then
        t.assert.deepStrictEqual(await getUser("1"), undefined)
    })

    test("should be able to handle any other errors", async (t: TestContext) => {
        // Given
        const testId = randomUUID()
        const testBaseUrl = `${baseUrl}/${testId}`
        const getUser = getUserFactory(testBaseUrl)

        const mock = await client.register({
            method: "GET",
            endpoint: `/${testId}/users/1`,
        }, {
            status: 500,
            body: { msg: "Internal server error" }
        })

        t.after(() => client.deleteMapping(mock.id))

        // When
        // Then
        await t.assert.rejects(getUser("1"), new Error(`Expected '200' but received '500' from '${testBaseUrl}/users/1' instead.`))
    })
})