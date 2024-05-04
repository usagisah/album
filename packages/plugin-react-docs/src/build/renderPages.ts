import { PluginBuildStartParam } from "@albumjs/album/server"
import { copy, outputFile } from "@albumjs/tools/lib/fs-extra"
import { rm } from "fs/promises"
import { minify } from "html-minifier-terser"
import { resolve } from "path"
import { PluginContext } from "../docs.type.js"
import { BuildTempModuleMap } from "./buildPages.js"

export async function renderPages(tempMap: BuildTempModuleMap, p: PluginBuildStartParam, context: PluginContext) {
  const { app, chunks, assets } = tempMap
  const { clientChunk: appClientChunk, serverOutPath } = app
  const { ssgRender } = await import(serverOutPath)
  const { docsConfig, albumContext } = context
  const { cwd } = albumContext.inputs
  const { outDir } = albumContext.outputs
  const { head, script, siteConfig } = docsConfig

  await rm(outDir, { force: true, recursive: true })
  await Promise.all(
    Object.values(chunks).map(async chunk => {
      const { appName, serverOutPath, clientChunk, routePath } = chunk
      let html = await ssgRender({
        url: "/" + appName,
        entryPath: `/assets/${appClientChunk.fileName}`,
        importPath: serverOutPath,
        contentPath: `/assets/${clientChunk.fileName}`,
        siteConfig,
        head,
        script,
        demoClientPath: "/assets/demos/Comp_$_.js"
      })
      html = await minify(html, {
        collapseWhitespace: true,
        caseSensitive: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true
      })
      await outputFile(resolve(outDir, routePath), html, "utf-8")
    })
  )
  await copy(resolve(cwd, ".temp/client"), resolve(outDir, "assets"))
}
