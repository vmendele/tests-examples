import { type Driver } from "./driver.ts";

export interface SystemUnderTest {
    /**
     * Create a driver to communicate with the system under test.
     */
    getDriver(): Promise<Driver>

    /**
     * Stop the system under test.
     */
    teardown(): Promise<void>
}