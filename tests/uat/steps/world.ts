import { type IWorldOptions, World } from "@cucumber/cucumber";
import { type SystemUnderTest } from "../sut/system-under-test.ts";
import { RunnerControlledSut } from "../sut/runner-controlled.ts";
import { createApp } from "../../../src/uat/create-app.ts";

export type CustomWorldParameters = {
    sut: {
        type: "controlled-by-runner"
    }
}

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
                })
            }
            default: {
                throw new Error(`Unknown SUT '${sut.type}'`)
            }
        } 
    }
}