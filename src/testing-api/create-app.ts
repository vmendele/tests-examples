// Cet exemple montre comment tester une application.
// Fastify est utilisé comme framework pour l'exemple mais le principe 
// reste le même avec Nest, Express, Koa, etc.
//
// L'application a deux routes `hello world`, une sur `/` et l'autre sur `/admin`.
// La particularité de `/admin` est qu'elle est activée si l'application est créée 
// avec l'env `ENABLE_ADMIN_ROUTE`.
//
// Cet exemple peut sembler inutile mais il démontre comment tester une application
// de bout en bout, du chargement de la configuration jusqu'au endpoint.

import { fastify, type FastifyReply, type FastifyRequest, type FastifyInstance } from "fastify"

export type CreateAppOpts = {
    envs: NodeJS.ProcessEnv
    // On pourrait également injecter le file system dans le cas où
    // l'on chargerait de la configuration par fichier.
}

const defaultOpts = { envs: process.env }

export function createApp (opts: CreateAppOpts = defaultOpts): FastifyInstance {
    const { envs } = opts
    const { ENABLE_ADMIN_ROUTE = "false" } = envs

    const app = fastify()
        .get("/", (req: FastifyRequest, res: FastifyReply) => ({ msg: "Hello world" }))
    
    if (ENABLE_ADMIN_ROUTE === "true") {
        app.get("/admin", (req: FastifyRequest, res: FastifyReply) => ({ msg: "Hello admin" }))
    }

    return app
}