import { describe, test, type TestContext } from "node:test"
import { type User, type UserRepository, UserService } from "../../../src/in-memory-mock/user-service.ts"

class InMemoryUserRepository implements UserRepository {
    users = new Map<string, User>()

    async get(id: string): Promise<User | undefined> {
        return this.users.get(id)
    }

    async update(user: User): Promise<void> {
        this.users.set(user.id, user)
    }

    addFakeUser(user: User): this {
        this.users.set(user.id, user)
        return this
    }


}

describe("UserService", () => {
    describe("disableUser", () => {
        test("should be able to disable a user", async (t: TestContext) => {
            // Given
            const repository = new InMemoryUserRepository()
                .addFakeUser({ id: "1", email: "foo@bar.com", active: true })

            const service = new UserService(repository)

            // When
            await service.disableUser("1")

            // Then
            t.assert.deepStrictEqual(repository.users.get("1"), { id: "1", email: "foo@bar.com", active: false })
        })

        test("should not be able to disable a unexistant user", async (t: TestContext) => {
            // Given
            const repository = new InMemoryUserRepository()

            const service = new UserService(repository)

            // When
            // Then
            await t.assert.rejects(service.disableUser("1"), new Error(`There is no user matching the ID '1'`))
        })
    })
})