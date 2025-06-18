// Cet exemple montre comment mocker la date actuelle dans un tests.
// Le code est plutôt simple, puisque la fonction testée filtre 
// les tâches expirées (dont la `dueDate` est inférieure à la date actuelle).
//
// Pour rendre ce code testable, il suffit de passer la date actuelle en paramètre
// de la fonction. Hors des tests, la fonction est appelée sans son second argument.

export type Todo = {
    title: string
    dueDate: Date
}

export function getExpiredTodos (todos: Todo[], now = () => new Date()): Todo[] {
    return todos.filter(todo => now().getTime() > todo.dueDate.getTime())
}

/*
// Without `now` injection, this function cannot be tested
export function getExpiredTodos (todos: Todo[]): Todo[] {
    return todos.filter(todo => todo.dueDate.getTime() < new Date().getTime())
}
*/