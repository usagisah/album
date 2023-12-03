import { stringify } from "@ungap/structured-clone/json"
import { writeFile } from "fs/promises"
import { resolve } from "path"
import { AlbumDevContext } from "../../context/context.type.js"
import { createCacheUserConfig } from "../../context/userConfig/start/createCacheUserConfig.js"

export async function buildStartConfig(context: AlbumDevContext) {
  const userConfig = createCacheUserConfig(context)
  const config = { ...userConfig }
  const output = resolve(context.info.outputs.outDir!, "album.config.js")
  await writeFile(output, stringify(config), "utf-8")
}
