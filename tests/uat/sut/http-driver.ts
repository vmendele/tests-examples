import supertest from "supertest";
import assert from "node:assert/strict"
import { type Driver } from "./driver.ts";

export class HttpDriver implements Driver {
    #agent: ReturnType<typeof supertest>

    constructor(agent: ReturnType<typeof supertest>) {
        this.#agent = agent
    }

    async createTodo(todo: unknown): Promise<void> {
        const { status, body } = await this.#agent.post("/todos")
            .send(todo as object)

        assert.deepEqual({ 
            status, 
            body: omit(body, [ "id" ])
        }, {
            status: 201,
            body: todo
        })
    }

    async assertTodosCreated(titles: string[]): Promise<void> {
        const { status, body } = await this.#agent.get("/todos")

        assert.equal(status, 200, `Expected '200' but received '${status}' with body '${JSON.stringify(body)}'`)

        const actualTitles = (body as any[]).map(todo => todo.title)

        assert.equal(
            arrayContains(actualTitles, titles), 
            true, 
            `'${titles.join(', ')}' is not contained in '${actualTitles.join(', ')}'`
        )
    }
}

function arrayContains (actual: string[], expected: string[]) {
    return expected.every(exp => actual.includes(exp))
}

function omit<T extends Record<never, never>>(obj: T, keys: (keyof T)[]): T {
    const copy = { ...obj }

    for (const key of keys) {
        delete copy[key]
    }

    return copy
}