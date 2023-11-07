import { writeFile } from "fs/promises"
import { AlbumDevContext } from "../../context/context.type.js"
import { createCacheUserConfig } from "../../context/userConfig/start/createCacheUserConfig.js"
import { SSRComposeDependencies } from "../../ssrCompose/ssrCompose.type.js"
import { stringify } from "@ungap/structured-clone/json"
import { resolve } from "path"

export async function buildStartConfig(context: AlbumDevContext, ssrComposeDependencies?: SSRComposeDependencies) {
  const userConfig = createCacheUserConfig(context)
  const config = {
    ...userConfig,
    ssrComposeDependencies
  }
  const output = resolve(context.info.outputs.outDir!, "album.config.js")
  const content = `export default ${stringify(config)}`
  await writeFile(output, content, "utf-8")
}