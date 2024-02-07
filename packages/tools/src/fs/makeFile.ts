import { Abortable } from "events"
import { Mode, ObjectEncodingOptions, OpenMode, existsSync } from "fs"
import { mkdir, writeFile } from "fs/promises"
import { dirname } from "path"
import { Stream } from "stream"

export type FileData = string | NodeJS.ArrayBufferView | Iterable<string | NodeJS.ArrayBufferView> | AsyncIterable<string | NodeJS.ArrayBufferView> | Stream
export type WriteOptions =
  | (ObjectEncodingOptions & {
      mode?: Mode | undefined
      flag?: OpenMode | undefined
    } & Abortable)
  | BufferEncoding
  | null
export async function makeFile(filePath: string, data: FileData, o: WriteOptions = "utf-8") {
  const dir = dirname(filePath)
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true })
  }
  return writeFile(filePath, data, o)
}
