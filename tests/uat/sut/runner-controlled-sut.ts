import { type FastifyInstance } from "fastify";
import { type Driver } from "./driver.ts";
import { type SystemUnderTest } from "./system-under-test.ts";
import supertest from "supertest";
import { HttpDriver } from "./http-driver.ts";
import { type CreateAppOpts } from "../../../src/uat/create-app.ts";
import { MongoDBContainer, StartedMongoDBContainer } from "@testcontainers/mongodb";

export type RunnerControlledSutOpts = {
    createApp: (opts?: CreateAppOpts) => FastifyInstance
    testedMongoDBImage: string
}

export class RunnerControlledSut implements SystemUnderTest {
    #opts: RunnerControlledSutOpts

    #mongodb: StartedMongoDBContainer | undefined
    #app: FastifyInstance | undefined
    #agent: ReturnType<typeof supertest> | undefined

    constructor(opts: RunnerControlledSutOpts) {
        this.#opts = opts
    }

    async getDriver(): Promise<Driver> {
        const agent = await this.#startAppIfNotStarted()

        return new HttpDriver(agent)
    }

    async teardown(): Promise<void> {
        await this.#app?.close()
        await this.#mongodb?.stop()
    }

    async #startAppIfNotStarted () {
        if (this.#mongodb === undefined) {
            this.#mongodb = await new MongoDBContainer(this.#opts.testedMongoDBImage).start()
        }

        if (this.#app === undefined) {
            this.#app = this.#opts.createApp({
                envs: {
                    MONGODB_URL: this.#mongodb.getConnectionString(),
                    MONGODB_DIRECT_CONNECTION: "true"
                }
            })
        }

        if (this.#agent === undefined) {
            await this.#app.listen({
                host: "0.0.0.0",
                port: 0
            })
            this.#agent = supertest(this.#app.server)
        }

        return this.#agent
    }
}