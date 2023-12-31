import { DirStruct } from "../utils/fs/fileManager.js"
import { Inputs } from "./context.dev.type.js"

export async function createFileManager({ cwd, dumpInput }: Inputs) {
  const dumpFileManager = await new DirStruct({ path: dumpInput }).write(true)
  const appFileManager = new DirStruct({ path: cwd })
  await appFileManager.add({
    type: "file",
    file: "album-env.d.ts",
    value: file => {
      const typeNode = `/// <reference types="@w-hite/album/types/node" />`
      const typeVite = `/// <reference types="@w-hite/album/types/vite-client" />`
      const contents: string[] = []
      if (!file.includes(typeNode)) contents.push(typeNode)
      if (!file.includes(typeVite)) contents.push(typeVite)
      if (contents.length === 0) return file
      else return file + "\n" + contents.join("\n")
    }
  })
  return { dumpFileManager, appFileManager }
}
