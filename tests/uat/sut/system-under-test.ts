import { type Driver } from "./driver.ts";

/**
 * Le System Under Test ou SUT est une abstraction permettant 
 * de découpler les tests du système testé.
 * 
 * Dans cet exemple, j'ai deux implémentation :
 * - `RunnerControlledSut` qui démarre lui-même l'application et sa base MongoDB.
 * - `ManuallyControlledSut` qui utilise une instance du système déjà démarré.
 * 
 * On pourrait imaginer une implémentation basée sur un client K8S Nodejs
 * afin de démarrer le SUT dans K8S.
 * 
 * Ce point d'abstraction permet aussi d'utiliser la même suite de test
 * contre plusieurs setup de l'application.
 * 
 * Par exemple, on pourrait créé un `ReplicatedRunnerControlledSut` qui 
 * lance plusieurs réplicas de l'application avec `testcontainers` avec un
 * nginx pour le load balancing.
 * Ainsi, on pourrait tester directement si l'app fonctionne en étant répliquer.
 */
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