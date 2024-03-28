import { PluginBuildStartParam } from "@albumjs/album/server"
import { copy } from "@albumjs/tools/lib/fs-extra"
import { basename, resolve } from "path"
import { InlineConfig, Rollup, build, mergeConfig } from "vite"
import { PluginContext } from "../docs.type.js"

export type TempModule = { app: boolean; routePath: string; clientOutPath: string; serverOutPath: string; client: Rollup.OutputChunk; server: Rollup.OutputChunk }
export type TempModuleMap = Map<string, TempModule>

export async function buildPages(p: PluginBuildStartParam, context: PluginContext) {
  const { resolveMiddlewareConfig, info } = p
  const { routes } = context
  const { inputs } = info
  const { viteConfigs } = await resolveMiddlewareConfig(true)

  const moduleEntries: Record<string, string> = { __app: "" }
  routes.map(item => {
    moduleEntries[basename(item.filepath)] = item.filepath
  })

  const clientBuildConfig = mergeConfig(viteConfigs, {
    build: {
      cssCodeSplit: false,
      emptyOutDir: true,
      outDir: resolve(inputs.cwd, ".temp/client"),
      ssr: false,
      ssrEmitAssets: false,
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
        entry: { ...moduleEntries, __app: resolve(inputs.dumpInput, "plugin-react-docs/main.tsx") },
        formats: ["es"]
      }
    }
  } as InlineConfig)
  const serverBuildConfig = mergeConfig(viteConfigs, {
    mode: "production",
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
        entry: { ...moduleEntries, __app: resolve(inputs.dumpInput, "plugin-react-docs/main.ssg.tsx") },
        formats: ["es"]
      }
    }
  } as InlineConfig)
  const index = serverBuildConfig.plugins.findIndex((v: any) => v.name === "vite:compression")
  if (index > -1) {
    serverBuildConfig.plugins.splice(index, 1)
  }
  const [clientResult, serverResult] = await Promise.all<any>([build(clientBuildConfig), build(serverBuildConfig)])
  await Promise.all([
    copy(resolve(inputs.dumpInput, "plugin-react-docs/docs.css"), resolve(inputs.cwd, ".temp/server/docs.css")),
    copy(resolve(inputs.dumpInput, "plugin-react-docs/normalize.css"), resolve(inputs.cwd, ".temp/server/normalize.css"))
  ])
  return makeModuleMap(context, { ...moduleEntries, __app: "app" }, clientResult[0], serverResult[0])
}

function makeModuleMap(context: PluginContext, moduleEntries: Record<string, string>, clientResult: Rollup.RollupOutput, serverResult: Rollup.RollupOutput) {
  const { routeMap, albumContext } = context
  const { cwd } = albumContext.inputs
  const map: TempModuleMap = new Map()
  for (const name in moduleEntries) {
    const isApp = name === "__app"
    const filepath = moduleEntries[name]
    map.set(filepath, { app: isApp, routePath: isApp ? null : routeMap.get(filepath).buildOutPath } as any)
  }
  clientResult.output.forEach(item => {
    if (item.type === "chunk") {
      const record = item.name === "__app" ? map.get("app") : map.get(item.facadeModuleId)
      if (record) {
        record.client = item
        record.clientOutPath = resolve(cwd, ".temp/client", item.fileName)
      }
    }
  })
  serverResult.output.forEach(item => {
    if (item.type === "chunk") {
      const record = item.name === "__app" ? map.get("app") : map.get(item.facadeModuleId)
      if (record) {
        record.server = item
        record.serverOutPath = resolve(cwd, ".temp/server", item.fileName)
      }
    }
  })
  return map
}
