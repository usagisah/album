import { PluginBuildStartParam } from "@albumjs/album/server"
import { copy, outputFile } from "@albumjs/tools/lib/fs-extra"
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
  const { outDir } = p.info.outputs
  const { cwd } = p.info.inputs
  const { scripts, siteConfig } = context.docsConfig
  await Promise.all(
    Array.from(tempMap.values()).map(async item => {
      if (item.app) {
        return
      }

      const { serverOutPath, client } = item
      const html = await ssgRender({ siteConfig, scripts, contentPath: serverOutPath, clientPath: `/assets/${client.fileName}` })
      await outputFile(resolve(outDir, `${client.name.replace(".page.md", "")}.html`), html, "utf-8")
    })
  )
  await copy(resolve(cwd, ".temp/client"), resolve(outDir, "assets"))
}
