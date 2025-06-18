import { describe, test, type TestContext } from "node:test"
import { getExpiredTodos, type Todo } from "../../../src/mocking-time/get-expired-todos.ts"

describe("getExpiredTodos", () => {
    test("should be able to filter the expired todos", (t: TestContext) => {
        // Given
        const todos: Todo[] = [
            {
                title: "Task 1",
                dueDate: new Date("2025-06-10T12:00:00.000Z")
            },
            {
                title: "Task 2",
                dueDate: new Date("2025-06-10T12:05:00.000Z")
            },
            {
                title: "Task 3",
                dueDate: new Date("2025-06-10T13:45:00.000Z")
            }
        ]

        const now = new Date("2025-06-10T12:15:00.000Z")

        // When
        // Then
        t.assert.deepStrictEqual(
            getExpiredTodos(todos, () => now),
            [
                {
                    title: "Task 1",
                    dueDate: new Date("2025-06-10T12:00:00.000Z")
                },
                {
                    title: "Task 2",
                    dueDate: new Date("2025-06-10T12:05:00.000Z")
                },
            ]
        )
    })
})