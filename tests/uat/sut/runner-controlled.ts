import { type FastifyInstance } from "fastify";
import { type Driver } from "./driver.ts";
import { type SystemUnderTest } from "./system-under-test.ts";
import supertest from "supertest";
import { HttpDriver } from "./http-driver.ts";


export type RunnerControlledSutOpts = {
    createApp: () => FastifyInstance
}

export class RunnerControlledSut implements SystemUnderTest {
    #opts: RunnerControlledSutOpts
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
    }

    async #startAppIfNotStarted () {
        if (this.#app === undefined) {
            this.#app = this.#opts.createApp()
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