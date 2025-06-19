import fastify from "fastify";
import { type TypeBoxTypeProvider } from "@fastify/type-provider-typebox"
import { type Static, Type } from "@sinclair/typebox"
import { fastifyMongodb } from "@fastify/mongodb"

export type CreateAppOpts = {
    envs: NodeJS.ProcessEnv
}

const defaultOpts: CreateAppOpts = { envs: process.env }

export function createApp (opts: CreateAppOpts = defaultOpts) {
    const {
        envs: {
            MONGODB_URL,
            MONGODB_DIRECT_CONNECTION = "false",
            MONGODB_DB_NAME = "todo-app"
        }
    } = opts

    if (typeof MONGODB_URL !== "string") {
        throw new Error("You must provide a MongoDB URL using the env 'MONGODB_URL'")
    }

    if (![ "true", "false" ].includes(MONGODB_DIRECT_CONNECTION)) {
        throw new Error(`Expected 'true' or 'false' for the env 'MONGODB_DIRECT_CONNECTION', received '${MONGODB_DIRECT_CONNECTION}'`)
    }

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
        id: Type.String(),
        title: Type.String(),
        status: Type.Union([
            Type.Literal("todo"),
            Type.Literal("done")
        ])
    })

    type Todo = Static<typeof todo>

    const todos: Todo[] = []
    let nextTodoId = 0

    app
        .register(fastifyMongodb, {
            url: MONGODB_URL,
            directConnection: MONGODB_DIRECT_CONNECTION === "true",
        })
        .register(instance => {
            const collection = instance.mongo.client.db(MONGODB_DB_NAME).collection<Omit<Todo, "id">>("todos");

            instance
                .withTypeProvider<TypeBoxTypeProvider>()
                .route({
                    method: "POST",
                    url: "/todos",
                    schema: {
                        body: createTodoBody,
                        response: {
                            201: todo
                        }
                    },
                    handler: async (req, res) => {

                        const { insertedId } = await collection.insertOne(req.body)

                        res.status(201)
                        return {
                            ...req.body,
                            id: insertedId.toHexString()
                        }
                    }
                })
                .route({
                    method: "GET",
                    url: "/todos",
                    schema: {
                        response: {
                            200: Type.Array(todo)
                        }
                    },
                    handler: async () => {
                        const records = await collection.find().toArray()
                        return records.map(({ _id, ...rest }) => ({ id: _id.toHexString(), ...rest }))
                    }
                })
        })

    return app
}