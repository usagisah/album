import { PluginBuildStartParam } from "@albumjs/album/server"
import { copy, outputFile } from "@albumjs/tools/lib/fs-extra"
import { rm } from "fs/promises"
import { resolve } from "path"
import { PluginContext } from "../docs.type.js"
import { TempModule, TempModuleMap } from "./buildPages.js"

export async function renderPages(tempMap: TempModuleMap, p: PluginBuildStartParam, context: PluginContext) {
  let app: TempModule
  tempMap.forEach(item => {
    if (item.app) {
      app = item
    }
  })
  const { serverOutPath } = app
  const { ssgRender } = await import(serverOutPath)
  const { docsConfig, albumContext } = context
  const { cwd } = albumContext.inputs
  const { outDir } = albumContext.outputs
  const { scripts, siteConfig } = docsConfig

  await rm(outDir, { force: true, recursive: true })
  await Promise.all(
    Array.from(tempMap.values()).map(async item => {
      if (item.app) {
        return
      }

      const { serverOutPath, client, routePath } = item
      const html = await ssgRender({
        entryPath: `/assets/${app.client.fileName}`,
        importPath: serverOutPath,
        contentPath: `/assets/${client.fileName}`,
        siteConfig,
        scripts
      })
      await outputFile(resolve(outDir, routePath), html, "utf-8")
    })
  )
  await copy(resolve(cwd, ".temp/client"), resolve(outDir, "assets"))
}
