import { PluginBuildStartParam } from "@albumjs/album/server"
import { copy, outputFile } from "@albumjs/tools/lib/fs-extra"
import { rm } from "fs/promises"
import { minify } from "html-minifier-terser"
import { resolve } from "path"
import { PluginContext } from "../docs.type.js"
import { BuildTempModuleMap } from "./buildPages.js"

export async function renderPages(tempMap: BuildTempModuleMap, p: PluginBuildStartParam, context: PluginContext) {
  const { app, chunks, assets, lib } = tempMap
  const { clientChunk: appClientChunk, serverOutPath } = app
  const { ssgRender } = await import(serverOutPath)
  const { docsConfig, albumContext } = context
  const { cwd } = albumContext.inputs
  const { outDir } = albumContext.outputs
  const { head, script, siteConfig } = docsConfig

  await rm(outDir, { force: true, recursive: true })
  await Promise.all(
    Object.values(chunks).map(async chunk => {
      const { url, serverOutPath, clientChunk, routePath } = chunk
      const importmap = `<script type="importmap">{"imports":{"@emotion/react/jsx-runtime": "/assets/${lib.emotion.fileName}"}}</script>`
      const cssAssets: string[] = []
      assets.forEach(item => {
        if (item.fileName.endsWith(".css")) {
          cssAssets.push(`<link rel="stylesheet" href="/assets/${item.fileName}">`)
        }
      })
      let html = await ssgRender({
        url,
        entryPath: `/assets/${appClientChunk.fileName}`,
        importPath: serverOutPath,
        contentPath: `/assets/${clientChunk.fileName}`,
        siteConfig,
        head: [importmap, ...head, ...cssAssets],
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
  await addEmotionExporterAlias(resolve(outDir, "assets", tempMap.lib.emotion.fileName), tempMap)
}

async function addEmotionExporterAlias(filepath: string, tempMap: BuildTempModuleMap) {
  const { code } = tempMap.lib.emotion
  const matched = code.match(/export \{[^}]+/)
  const exporterLines = matched[0].split(",")
  const jsxLines = exporterLines.filter(s => s.includes("as") && s.includes("jsx"))
  const aliasExporters: string[] = []
  for (const line of jsxLines) {
    const n = line.split("as").map(s => s.trim())[0]
    aliasExporters.push(n)
  }
  if (aliasExporters.length > 0) {
    const originEndIndex = matched.index + matched[0].length
    const _code = `${code.slice(0, originEndIndex)},${aliasExporters.join(",")}${code.slice(originEndIndex)}`
    await outputFile(filepath, _code, "utf-8")
  }
}
