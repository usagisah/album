import { createFileManager as _createFileManager } from "@albumjs/tools/node"
import { readFile } from "fs/promises"
import { createCommonJS } from "mlly"
import { resolve } from "path"
import { Inputs } from "./context.dev.type.js"

const { __dirname } = createCommonJS(import.meta.url)
export async function createFileManager(ssr: boolean, { cwd, dumpInput }: Inputs) {
  const dumpFileManager = await _createFileManager({ root: dumpInput })
  const appFileManager = await _createFileManager({ root: cwd })
  const tempFiles = Promise.all([
    readFile(resolve(__dirname, "../../template/album.client.ts")),
    readFile(resolve(__dirname, "../../template/album.server.ts")),
    readFile(resolve(__dirname, "../../types/album.d.ts"))
  ])
  await Promise.all([
    dumpFileManager.add("file", "album.client.ts", { value: tempFiles[0], force: true }),
    ssr ? dumpFileManager.add("file", "album.server.ts", { value: tempFiles[1], force: true }) : Promise.resolve(),
    dumpFileManager.add("file", "album.d.ts", { value: tempFiles[2], force: true }),
    appFileManager.add("file", "album-env.d.ts", {
      force: true,
      value: () => {
        const contents: string[] = [`/// <reference types="albumjs/types/node" />`, `/// <reference types="albumjs/types/vite-client" />`, `/// <reference types=".album/album" />`]
        return contents.join("\n") + "\n"
      }
    })
  ])
  return { dumpFileManager, appFileManager }
}
