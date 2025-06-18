// Avec cet exemple, le test devient plus complex.
//
// Ici, grâce à `testcontainers`, je test `TodoRepository` sur 
// une vraie instance de MongoDB au lieu de mocker la collection
// comme je l'ai fait pour le file system dans [l'exemple du mock de file system](../../units/mocking-file-system).
//
// La raison pour laquelle je test directement avec MongoDB, c'est que la préoccupation
// principale de `TodoRepository` est d'intéragir avec MongoDB, et intéragir avec MongoDB.
// amène son lot d'erreur.
// Je pourrais me tromper en écrivant un filtre lors d'une recherche, en voulant catcher 
// une erreur spécifique du client, ou écrivant une mauvaise mutation avec `findOneAndUpdate`.
//
// En bref, beaucoup de chose peuvent mal se passer en communiquant avec une base de données,
// alors qu'avec un file system, c'est beaucoup plus simple.
//
// Comme je l'ai écrit précedemment, ces tests utilisent `testcontainers`, une bibliothèque 
// disponible dans plusieurs langage et qui permet de démarrer des conteneurs docker de tests.
import { describe, test, type TestContext, before, after } from "node:test"
import { type Todo, TodoRepository } from "../../../src/testing-db-queries/todos.ts"
import { randomUUID } from "crypto"
import { MongoDBContainer, type StartedMongoDBContainer } from "@testcontainers/mongodb"
import { MongoClient } from "mongodb"

describe("TodoRepository", () => {
    let mongo!: StartedMongoDBContainer
    let client!: MongoClient

    before(async () => {
        // Démarre une nouvelle instance de MongoDB.
        //
        // Pour démarrer cette instance, j'utilise le wrapper `@testcontainers/mongodb`
        // qui facilite l'utilisation d'un conteneur MongoDB avec `testcontainers`.
        // Si ce paquet n'existait pas, je devrais utiliser `GenericContainer` du paquet
        // `testcontainers` tel que : 
        // ````
        // mongo = await new GenericContainer("mongo:8")
        //  .withExposedPorts(27017)
        //  .withEnvironments({
        //    MONGO_INITDB_ROOT_USER: "root",
        //    MONGO_INITDB_ROOT_PASSWORD: "root"
        //  })
        //  .start()
        // ```
        // 
        // puis le client MongoDB serait créé comme ceci :
        // ```
        // const client = new MongoClient(
        //   `mongodb://root:root@${mongo.getHost()}:${mongo.getFirstMappedPort()}`,
        //                       // ^^^^^^^^^^^^^^^
        //                       // Je n'utilise pas localhost car l'host peut changer dans le CI.
        //   { directConnection: true }
        // )
        // ```
        mongo = await new MongoDBContainer("mongo:8").start()
        // Un client MongoDB est branché sur l'instance MongoDB de testcontainers.
        // Ce client et l'instance de test sont partagés entre tous les tests.
        client = new MongoClient(mongo.getConnectionString(), {
            directConnection: true
        })
    })

    after(async () => {
        await client?.close(true)
        await mongo?.stop()
    })

    test("should be able to create a todo", async (t: TestContext) => {
        // Given
        // Cette instruction est très importante car elle garantie l'isolation de nos tests.
        // Les tests doivent être isolés les uns des autres.
        // Cette propriété nous permet de réarranger les tests afin de les exécuter en parallèle plus tard.
        const collection = client.db(randomUUID()).collection<Omit<Todo, "id">>(randomUUID())
        const repository = new TodoRepository(collection)

        // When
        const todo = await repository.create({
            status: "todo",
            title: "Task 1"
        })

        // Then
        t.assert.deepStrictEqual(await repository.search(), [
            todo
        ])
    })

    test("should be able to search todos by status", async (t: TestContext) => {
        // Given
        const collection = client.db(randomUUID()).collection<Omit<Todo, "id">>(randomUUID())
        const repository = new TodoRepository(collection)

        // When
        const todo1 = await repository.create({
            status: "todo",
            title: "Task 1"
        })

        const todo2 = await repository.create({
            status: "done",
            title: "Task 2"
        })

        const todo3 = await repository.create({
            status: "done",
            title: "Task 3"
        })

        // Then
        t.assert.deepStrictEqual(await repository.search({ status: "done" }), [
            todo2,
            todo3
        ])
        t.assert.deepStrictEqual(await repository.search({ status: "todo" }), [
            todo1,
        ])
    })

    test("shoud be able to search todos by title", async (t: TestContext) => {
        // Given
        const collection = client.db(randomUUID()).collection<Omit<Todo, "id">>(randomUUID())
        const repository = new TodoRepository(collection)

        // When
        const todo1 = await repository.create({
            status: "todo",
            title: "Task 9"
        })

        const todo2 = await repository.create({
            status: "done",
            title: "Task 10"
        })

        const todo3 = await repository.create({
            status: "done",
            title: "Task 11"
        })

        // Then
        t.assert.deepStrictEqual(await repository.search({ title: "Task" }), [
            todo1,
            todo2,
            todo3
        ])
        t.assert.deepStrictEqual(await repository.search({ title: "Task 1" }), [
            todo2,
            todo3
        ])
    })

    test("should be able to search todos by title even with the wrong case", async (t: TestContext) => {
        // Given
        const collection = client.db(randomUUID()).collection<Omit<Todo, "id">>(randomUUID())
        const repository = new TodoRepository(collection)

        // When
        const todo1 = await repository.create({
            status: "todo",
            title: "Task 9"
        })

        const todo2 = await repository.create({
            status: "done",
            title: "task 10"
        })

        const todo3 = await repository.create({
            status: "done",
            title: "Task 11"
        })

        // Then
        t.assert.deepStrictEqual(await repository.search({ title: "Task" }), [
            todo1,
            todo2,
            todo3
        ])
        t.assert.deepStrictEqual(await repository.search({ title: "Task 1" }), [
            todo2,
            todo3
        ])
    })
})