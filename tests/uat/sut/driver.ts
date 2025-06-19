/**
 * Le driver sert à découpler les tests du canal d'utilisation de l'application.
 * 
 * L'application testée n'a qu'un canal : son API.
 * 
 * Si l'application avait un front-end, alors nous pourrions implémenter un `PupeeterDriver`
 * qui piloterai un navigateur headless afin de tester l'application depuis l'interface.
 */
export interface Driver {
    createTodo(todo: unknown): Promise<void>
    assertTodosCreated(title: string[]): Promise<void> 
}