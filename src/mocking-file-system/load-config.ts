// Cet exemple démontre comment tester une fonction utilisant
// le file system.
//
// Le rôle de la fonction `loadConfig` est de charger une configuration
// depuis un fichier JSON.
// 
// Pour rendre le code testable, il suffit d'injecter les fonctions de `fs`
// en paramètre de la fonction. Ainsi, les tests peuvent définir une fausse implémentation
// controllable.
import { readFile } from "node:fs/promises"

export type FileSystem = {
    readFile: typeof readFile
}

const defaultFs = { readFile }

export async function loadConfig(filename: string, fs: FileSystem = defaultFs): Promise<unknown> {
    const content = await fs.readFile(filename, "utf-8")

    return JSON.parse(content)
}

/**
import { readFile } from "node:fs/promises"

export async function loadConfig (filename: string): Promise<unknown> {
    const content = await readFile(filename, "utf-8")

    return JSON.parse(content)
}
 */