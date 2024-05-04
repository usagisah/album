import { PluginBuildStartParam } from "@albumjs/album/server"
import { extname, resolve } from "path"
import { InlineConfig, Rollup, build, mergeConfig } from "vite"
import { PluginContext } from "../docs.type.js"

export type BuildTempModule = { url: string; routePath: string; clientOutPath: string; serverOutPath: string; clientChunk: Rollup.OutputChunk; serverChunk: Rollup.OutputChunk }
export type BuildTempModuleMap = {
  app: BuildTempModule
  chunks: Record<string, BuildTempModule>
  assets: Rollup.OutputAsset[]
  lib: Record<string, Rollup.OutputChunk & { filepath: string }>
}

export async function buildPages(p: PluginBuildStartParam, context: PluginContext) {
  const { resolveMiddlewareConfig, info } = p
  const { routes } = context
  const { inputs } = info
  const { viteConfigs } = await resolveMiddlewareConfig(true)

  const sourceModuleEntries: Record<string, string> = { __app: "" }
  routes.map(item => {
    const ext = extname(item.buildOutPath)
    sourceModuleEntries[item.buildOutPath.slice(0, -1 * ext.length)] = item.filepath
  })

  const clientBuildConfig = mergeConfig(viteConfigs, {
    define: {
      "process.env.NODE_ENV": "'development'"
    },
    build: {
      cssCodeSplit: false,
      emptyOutDir: true,
      outDir: resolve(inputs.cwd, ".temp/client"),
      ssr: false,
      ssrEmitAssets: false,
      copyPublicDir: false,
      manifest: false,
      ssrManifest: false,
      minify: false,
      cssMinify: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id, ctx) {
            if (id.includes("@emotion")) {
              return "_emotion"
            }
            if (id === "antd" || id.startsWith("react") || id.includes("node_modules") || id.includes("scheduler")) {
              return "_framework"
            }
          }
        }
      },
      lib: {
        entry: { ...sourceModuleEntries, __app: resolve(inputs.dumpInput, "plugin-react-docs/main.tsx") },
        formats: ["es"]
      }
    }
  } as InlineConfig)
  const serverBuildConfig = mergeConfig(viteConfigs, {
    build: {
      cssCodeSplit: false,
      emptyOutDir: true,
      outDir: resolve(inputs.cwd, ".temp/server"),
      ssr: true,
      manifest: false,
      minify: false,
      copyPublicDir: false,
      cssMinify: false,
      sourcemap: false,
      lib: {
        entry: { ...sourceModuleEntries, __app: resolve(inputs.dumpInput, "plugin-react-docs/main.ssg.tsx") },
        formats: ["es"]
      }
    }
  } as InlineConfig)
  const index = serverBuildConfig.plugins.findIndex((v: any) => v.name === "vite:compression")
  if (index > -1) {
    serverBuildConfig.plugins.splice(index, 1)
  }
  const [clientResult, serverResult] = await Promise.all<any>([build(clientBuildConfig), build(serverBuildConfig)])
  return makeOutModuleMap(context, { ...sourceModuleEntries, __app: "app" }, clientResult[0], serverResult[0])
}

function makeOutModuleMap(
  context: PluginContext,
  sourceModuleEntries: Record<string, string>,
  clientResult: Rollup.RollupOutput,
  serverResult: Rollup.RollupOutput
): BuildTempModuleMap {
  const { routeMap, albumContext } = context
  const { cwd } = albumContext.inputs
  const map: BuildTempModuleMap = { app: {}, chunks: {}, assets: [], lib: {} } as any

  for (const name in sourceModuleEntries) {
    const isApp = name === "__app"
    const filepath = sourceModuleEntries[name]
    if (isApp) {
      map.app = {} as any
    } else {
      map.chunks[filepath] = { routePath: routeMap.get(filepath).buildOutPath } as any
    }
  }
  clientResult.output.forEach(chunk => {
    if (chunk.type === "chunk") {
      if (chunk.name === "_emotion") {
        map.lib.emotion = { ...chunk, filepath: resolve(cwd, ".temp/client", chunk.fileName) }
      }

      const record = chunk.name === "__app" ? map.app : map.chunks[chunk.facadeModuleId]
      if (record) {
        record.clientChunk = chunk
        record.clientOutPath = resolve(cwd, ".temp/client", chunk.fileName)

        if (chunk.name !== "__app") {
          record.url = ("/" + routeMap.get(chunk.facadeModuleId).buildOutPath.slice(0, -1 * ".html".length)).replaceAll("index", "")
        }
      }
      return
    }
    map.assets.push(chunk)
  })

  serverResult.output.forEach(chunk => {
    if (chunk.type === "chunk") {
      const record = chunk.name === "__app" ? map.app : map.chunks[chunk.facadeModuleId]
      if (record) {
        record.serverChunk = chunk
        record.serverOutPath = resolve(cwd, ".temp/server", chunk.fileName)
      }
    }
  })

  return map
}
