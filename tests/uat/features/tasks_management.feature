# language: fr
Fonctionnalité: Gestion des tâches

Scénario: Création d'une tâche
    Lorsque je créé une tâche:
        | titre  | Task 1 |
        | statut | todo   |
    Et que je créé une tâche:
        | titre  | Task 2 |
        | statut | todo   |
    Alors les tâches devraient être crées :
        | Task 1 |
        | Task 2 |

