import { type Abortable } from "events"
import { type PathLike, type OpenMode, type ObjectEncodingOptions } from "fs"
import { type FileHandle } from "fs/promises"
import { type FileSystem } from "../../../src/mocking-file-system/load-config.ts"


class FakeENOENTError extends Error {
    code = "ENOENT";

    constructor(path: string) {
        super(`ENOENT: no such file or directory, open '${path}'`);
    }
}

type ReadFileOpts =
    | ({ encoding?: null | undefined; flag?: OpenMode | undefined } & Abortable)
    | (
            | ({ encoding: BufferEncoding; flag?: OpenMode | undefined } & Abortable)
            | BufferEncoding
      )
    | (
            | (ObjectEncodingOptions & Abortable & { flag?: OpenMode | undefined })
            | BufferEncoding
            | null
      );

export class FakeFileSystem implements FileSystem {
    #files = new Map<string, Buffer | string>()

    mockFile(path: string, content: Buffer | string): this {
        this.#files.set(path, content);
        return this;
    }

    readFile(
        path: PathLike | FileHandle,
        options?:
            | ({
                    encoding?: null | undefined;
                    flag?: OpenMode | undefined;
              } & Abortable)
            | null,
    ): Promise<Buffer>;
    readFile(
        path: PathLike | FileHandle,
        options:
            | ({ encoding: BufferEncoding; flag?: OpenMode | undefined } & Abortable)
            | BufferEncoding,
    ): Promise<string>;
    readFile(
        path: PathLike | FileHandle,
        options?:
            | (ObjectEncodingOptions & Abortable & { flag?: OpenMode | undefined })
            | BufferEncoding
            | null,
    ): Promise<string | Buffer>;
    async readFile(
        path: PathLike | FileHandle,
        options?: ReadFileOpts,
    ): Promise<string | Buffer> {
        if (typeof path !== "string") {
            throw new Error("Not implemented at line 25 in fake-file-system.ts");
        }

        const mFile = this.#files.get(path);

        if (mFile === undefined) {
            throw new FakeENOENTError(path);
        }

        return mFile;
    }
}