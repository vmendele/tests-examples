import { After, setWorldConstructor } from "@cucumber/cucumber";
import { CustomWorld } from "./world.ts";

setWorldConstructor(CustomWorld)

After(async function (this: CustomWorld) {
    await this.sut.teardown()
})