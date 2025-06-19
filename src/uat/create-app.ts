import fastify from "fastify";
import { type TypeBoxTypeProvider } from "@fastify/type-provider-typebox"
import { type Static, Type } from "@sinclair/typebox"

export function createApp () {
    const app = fastify()
        .withTypeProvider<TypeBoxTypeProvider>()

    const createTodoBody = Type.Object({
        title: Type.String(),
        status: Type.Union([
            Type.Literal("todo"),
            Type.Literal("done")
        ])
    })

    const todo = Type.Object({
        id: Type.Number(),
        title: Type.String(),
        status: Type.Union([
            Type.Literal("todo"),
            Type.Literal("done")
        ])
    })

    type Todo = Static<typeof todo>

    const todos: Todo[] = []
    let nextTodoId = 0

    app.route({
        method: "POST",
        url: "/todos",
        schema: {
            body: createTodoBody,
            response: {
                201: todo
            }
        },
        handler: (req, res) => {
            const todo: Todo = {
                ...req.body,
                id: nextTodoId++
            }

            todos.push(todo)

            res.status(201)
            return todo
        }
    })

    app.route({
        method: "GET",
        url: "/todos",
        schema: {
            response: {
                200: Type.Array(todo)
            }
        },
        handler: () => {
            return todos
        }
    })

    return app
}