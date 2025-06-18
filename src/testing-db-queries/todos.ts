// Cet exemple décrit une classe `TodoRepository` chargée de d'intéragir 
// avec une base de données MongoDB.
//
// Voir le fichier de test pour le reste des explications.
import { type Collection } from "mongodb"

export type Todo = {
    id: string
    title: string
    status: "todo" | "done"
}

export type SearchTodosOpts = {
    status?: "todo" | "done"
    title?: string
}

export class TodoRepository {
    #collection: Collection<Omit<Todo, "id">>

    constructor(collection: Collection<Omit<Todo, "id">>) {
        this.#collection = collection
    }

    async create(todo: Omit<Todo, "id">): Promise<Todo> {
        const { insertedId } = await this.#collection.insertOne(
            // we must shallow clone because the mongo client adds a _id to the object.
            { ...todo }
        )
        return { ...todo, id: insertedId.toHexString() }
    }

    async search(opts: SearchTodosOpts = {}): Promise<Todo[]> {
        const { status, title } = opts

        const records = await this.#collection.find({
            ...status !== undefined && {
                status,
            },
            ...title !== undefined && {
                // For the sake of simplicity, I'm not sanitizing the input.
                // This code has a RegExp injection vulnerability, and also
                // a ReDos since you can pass a really long string.
                title: { $regex: `.*${title}.*`, $options: "i" }
            }
        }).toArray()
        return records.map(({ _id, ...todo }) => ({ ...todo, id: _id.toHexString() }))
    }
}