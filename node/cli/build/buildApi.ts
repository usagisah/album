import { sep } from "path"
import { rsModuleRewrite } from "../../builder/rspack/rsModule.js"
import { rsBuild } from "../../builder/rspack/rspack.build.js"
import { AlbumContext } from "../../context/context.dev.type.js"

export async function buildApi(context: AlbumContext) {
  const { inputs, outputs, env, serverManager, logger } = context
  const { appModule, tsconfig } = serverManager
  const { filename, input } = appModule
  if (input) {
    logger.log("正在打包服务端(api)，请耐心等待...", "album")
    const error = await rsBuild("build", {
      env,
      filename,
      input,
      output: outputs.apiOutDir!,
      tsconfig,
      cwd: inputs.cwd
    })
    if (error) throw error
    await rsModuleRewrite(`${outputs.apiOutDir}${sep}${filename}`)
    logger.log("打包服务端(api)成功", "album")
  }
}
