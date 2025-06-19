import { When, Then, type DataTable } from "@cucumber/cucumber"
import { CustomWorld } from "./world.ts"

When("je créé une tâche:", async function (this: CustomWorld, table: DataTable) {
    const {
        titre: title,
        statut: status
    } = table.rowsHash()

    const driver = await this.sut.getDriver()
    await driver.createTodo({ title, status })
})

Then("les tâches devraient être crées :", async function (this: CustomWorld, table: DataTable) {
    const titles = table.raw().flat()

    const driver = await this.sut.getDriver()
    await driver.assertTodosCreated(titles)
})
