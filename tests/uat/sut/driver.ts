export interface Driver {
    createTodo(todo: unknown): Promise<void>
    assertTodosCreated(title: string[]): Promise<void> 
}