import { type IWorldOptions, World } from "@cucumber/cucumber";
import { type SystemUnderTest } from "../sut/system-under-test.ts";
import { RunnerControlledSut } from "../sut/runner-controlled-sut.ts";
import { createApp } from "../../../src/uat/create-app.ts";
import { ManuallyControlledSut } from "../sut/manually-controlled-sut.ts";

export type CustomWorldParameters = {
    sut: {
        type: "controlled-by-runner"
        testedMongoDBImage: string
    } | {
        type: "controlled-manually"
        baseUrl: string
    }
}

/**
 * Une instance de monde est partagée entre les steps d'un même scénario.
 */
export class CustomWorld extends World {
    readonly sut: SystemUnderTest

    constructor(opts: IWorldOptions<CustomWorldParameters>) {
        super(opts)
        this.sut = CustomWorld.setupSut(opts.parameters)
    }

    static setupSut({ sut }: CustomWorldParameters): SystemUnderTest {
        switch(sut.type) {
            case "controlled-by-runner": {
                return new RunnerControlledSut({
                    createApp,
                    testedMongoDBImage: sut.testedMongoDBImage
                })
            }
            case "controlled-manually": {
                return new ManuallyControlledSut(sut.baseUrl)
            }
            default: {
                // @ts-expect-error
                throw new Error(`Unknown SUT '${sut.type}'`)
            }
        } 
    }
}