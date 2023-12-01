import { basename } from "path"
import { DirStruct } from "../../utils/fs/fileManager.js"
import { DevInputs } from "../inputs/inputs.type.js"

export async function createFileManager({ cwd, dumpInput }: DevInputs) {
  const dumpFileManager = await new DirStruct({ name: ".album", path: dumpInput }).create()
  const appFileManager = new DirStruct({ name: basename(cwd), path: cwd })
  await appFileManager.add("file", "album-env.d.ts", `/// <reference types="@w-hite/album/types/node" />\n/// <reference types="@w-hite/album/types/vite-client" />`)
  return { dumpFileManager, appFileManager }
}
