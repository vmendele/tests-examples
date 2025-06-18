// Cette exemple montre un service nommé `UserService`
// qui permet de désactiver un utilisateur grâce à `disableUser`.
// 
// L'exécution de `disableUser` dépend d'une implémentation de 
// `UserRepository` qui devra être mocké durant les tests.

export type User = {
  id: string
  email: string
  active: boolean
}

export interface UserRepository {
  get(id: string): Promise<User | undefined>
  update(user: User): Promise<void>
}

export class UserService {
  #repository: UserRepository
  
  constructor(repository: UserRepository) {
    this.#repository = repository;
  }
  
  async disableUser(id: string): Promise<void> {
    const mUser = await this.#repository.get(id)
    
    if (mUser === undefined) {
      throw new Error(`There is no user matching the ID '${id}'`)
    }
    
    const newUser: User = {
      ...mUser,
      active: false
    }
    
    await this.#repository.update(newUser)
  }
}