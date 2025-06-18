// Cet exemple montre une fonction `getUser` qui récupère un utilisateur
// depuis un point d'API `/users/:userId`.
// 
// L'API répond 200 si un utilisateur est trouvé, et 404 si l'utilisateur n'existe pas.
// On sait également que l'API répond d'autres status code qui signifie tous que quelque 
// chose s'est mal passé.
//
// Pour tester cette fonction, il est possible d'injecter la fonction fetch et de 
// passer un fetch mocké durant les tests.
//
// Ici, je ne le fais pas car je souhaite montrer comment mocker une API HTTP
// avec un serveur de mock.

export type User = {
    id: string
    email: string
}

export class UnexpectedHttpResponseError extends Error {
    constructor(response: Response, expectedStatus: number) {
        super(`Expected '${expectedStatus}' but received '${response.status}' from '${response.url}' instead.`)
    }
}

export function getUserFactory(baseUrl: string) {
    return async function getUser (userId: string): Promise<User | undefined> {
        const response = await fetch(`${baseUrl}/users/${userId}`)

        if (response.status === 404) {
            return undefined
        }

        if (response.status !== 200) {
            throw new UnexpectedHttpResponseError(response, 200)
        }

        // we should validate this, but it would complicate the example
        return await response.json()
    }
}