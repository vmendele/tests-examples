import supertest from "supertest";
import { type Driver } from "./driver.ts";
import { HttpDriver } from "./http-driver.ts";
import { type SystemUnderTest } from "./system-under-test.ts";

/**
 * Dans ce scénario, le system under test n'est pas controllé par le test runner.
 * Pour l'exemple, j'utilise docker compose, mais je pourrais démarrer le system 
 * under test dans un namespace K8S.
 */
export class ManuallyControlledSut implements SystemUnderTest {
    #baseUrl: string

    constructor(baseUrl: string) {
        this.#baseUrl = baseUrl
    }

    async getDriver(): Promise<Driver> {
        return new HttpDriver(supertest(this.#baseUrl))
    }

    async teardown(): Promise<void> {
        // rien à faire ici puisque le SUT n'est pas géré par le test runner.
    }
}