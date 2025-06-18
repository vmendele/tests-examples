// Dans cet exemple, les tests vérifient le bon fonctionnement de l'application.
// Dans un scénario réel, ces tests démareraient également un conteneur pour la 
// base de données.

import { type FastifyInstance } from "fastify"
import { describe, test, type TestContext } from "node:test"
import supertest from "supertest"
import { createApp } from "../../../src/testing-api/create-app.ts"

describe("app", () => {
    test("should be able to respond to '/'", async (t: TestContext) => {
        // Given
        // L'application est configurée
        const app = createApp({ envs: {} })
        // L'application est démarré sur un port aléatoire.
        // Le helper `startApp` démarre l'app et renvoie un agent permettant 
        // de communiquer avec l'app directement.
        const agent = await startApp(app)

        t.after(() => app.close())

        // When
        // Then
        await agent.get("/")
            .expect(({ status, body }) => t.assert.deepStrictEqual({ status, body }, {
                status: 200,
                body: { msg: "Hello world" }
            }))
    })

    test("should not be able to respond to '/admin' by default", async (t: TestContext) => {
        // Given
        const app = createApp({ envs: {} })
        const agent = await startApp(app)

        t.after(() => app.close())

        // When
        // Then
        await agent.get("/admin")
            .expect(({ status, body }) => t.assert.deepStrictEqual({ status, body }, {
                status: 404,
                body: {
                    error: "Not Found",
                    message: 'Route GET:/admin not found',
                    statusCode: 404
                }
            }))
    })

    test("should be able to respond to '/admin' if the env 'ENABLE_ADMIN_ROUTE: true' is specified", async (t: TestContext) => {
        // Given
        const app = createApp({ envs: { ENABLE_ADMIN_ROUTE: 'true' } })
        const agent = await startApp(app)

        t.after(() => app.close())

        // When
        // Then
        await agent.get("/admin")
            .expect(({ status, body }) => t.assert.deepStrictEqual({ status, body }, {
                status: 200,
                body: {
                    msg: "Hello admin"
                }
            }))
    })
})

async function startApp (app: FastifyInstance) {
    // start the app on a random port
    await app.listen({ host: "0.0.0.0", port: 0 })

    return supertest(app.server)
}