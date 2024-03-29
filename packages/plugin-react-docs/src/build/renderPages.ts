import { PluginBuildStartParam } from "@albumjs/album/server"
import { copy, outputFile } from "@albumjs/tools/lib/fs-extra"
import { rm } from "fs/promises"
import { resolve } from "path"
import { PluginContext } from "../docs.type.js"
import { TempModuleMap } from "./buildPages.js"

export async function renderPages(tempMap: TempModuleMap, p: PluginBuildStartParam, context: PluginContext) {
  const { app, chunks, assets } = tempMap
  const { clientChunk: appClientChunk, serverOutPath } = app
  const { ssgRender } = await import(serverOutPath)
  const { docsConfig, albumContext } = context
  const { cwd } = albumContext.inputs
  const { outDir } = albumContext.outputs
  const { scripts, siteConfig } = docsConfig

  await rm(outDir, { force: true, recursive: true })
  await Promise.all(
    Object.values(chunks).map(async chunk => {
      const { serverOutPath, clientChunk, routePath } = chunk
      const html = await ssgRender({
        entryPath: `/assets/${appClientChunk.fileName}`,
        importPath: serverOutPath,
        contentPath: `/assets/${clientChunk.fileName}`,
        siteConfig,
        scripts
      })
      await outputFile(resolve(outDir, routePath), html, "utf-8")
    })
  )
  await copy(resolve(cwd, ".temp/client"), resolve(outDir, "assets"))
}