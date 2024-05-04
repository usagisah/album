import { PluginBuildStartParam } from "@albumjs/album/server"
import { basename, resolve } from "path"
import { InlineConfig, Rollup, build, mergeConfig } from "vite"
import { PluginContext } from "../docs.type.js"

export type BuildTempModule = { appName: string; routePath: string; clientOutPath: string; serverOutPath: string; clientChunk: Rollup.OutputChunk; serverChunk: Rollup.OutputChunk }
export type BuildTempModuleMap = {
  app: BuildTempModule
  chunks: Record<string, BuildTempModule>
  assets: Rollup.OutputAsset[]
}

export async function buildPages(p: PluginBuildStartParam, context: PluginContext) {
  const { resolveMiddlewareConfig, info } = p
  const { routes } = context
  const { inputs } = info
  const { viteConfigs } = await resolveMiddlewareConfig(true)

  const sourceModuleEntries: Record<string, string> = { __app: "" }
  routes.map(item => {
    sourceModuleEntries[basename(item.filepath)] = item.filepath
  })

  const clientBuildConfig = mergeConfig(viteConfigs, {
    build: {
      cssCodeSplit: false,
      emptyOutDir: true,
      outDir: resolve(inputs.cwd, ".temp/client"),
      ssr: false,
      ssrEmitAssets: false,
      copyPublicDir: true,
      manifest: false,
      ssrManifest: false,
      minify: true,
      cssMinify: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id, ctx) {
            if (id === "antd" || id.startsWith("react") || id.includes("@emotion/") || id.includes("node_modules") || id.includes("scheduler")) {
              return "framework"
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
  const map: BuildTempModuleMap = { app: {}, chunks: {}, assets: [] } as any

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
      const record = chunk.name === "__app" ? map.app : map.chunks[chunk.facadeModuleId]
      if (record) {
        record.clientChunk = chunk
        record.clientOutPath = resolve(cwd, ".temp/client", chunk.fileName)

        if (chunk.name !== "__app") {
          record.appName = routeMap.get(chunk.facadeModuleId).appName
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
