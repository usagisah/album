import { createFileManager as _createFileManager } from "@albumjs/tools/node"
import { readFile } from "fs/promises"
import { createCommonJS } from "mlly"
import { resolve } from "path"
import { Inputs } from "./context.dev.type.js"

const { __dirname } = createCommonJS(import.meta.url)
export async function createFileManager(ssr: boolean, ssrCompose: boolean, { cwd, dumpInput }: Inputs) {
  const [dumpFileManager, appFileManager] = await Promise.all([_createFileManager({ root: dumpInput }), _createFileManager({ root: cwd, create: false })])
  const tempFiles = await Promise.all([
    readFile(resolve(__dirname, "../../template/album.client.ts"), "utf-8"),
    readFile(resolve(__dirname, "../../template/album.server.ts"), "utf-8"),
    readFile(resolve(__dirname, "../../types/album.d.ts"), "utf-8")
  ])
  const pendingPromises: Promise<any>[] = [
    dumpFileManager.add("file", "album.client.ts", { value: tempFiles[0], force: true }),
    dumpFileManager.add("file", "album.d.ts", { value: tempFiles[2], force: true }),
    appFileManager.add("file", "album-env.d.ts", {
      force: true,
      value: () => {
        const contents: string[] = [
          `/// <reference types="@albumjs/album/types/node" />`,
          `/// <reference types="@albumjs/album/types/vite-client" />`,
          `/// <reference types=".album/album" />`
        ]
        return contents.join("\n") + "\n"
      }
    }),
    dumpFileManager.add("file", "album.dependency.ts")
  ]
  if (ssr) {
    pendingPromises.push(dumpFileManager.add("file", "album.server.ts", { value: tempFiles[1], force: true }))
  }
  await Promise.all(pendingPromises)
  return { dumpFileManager, appFileManager }
}