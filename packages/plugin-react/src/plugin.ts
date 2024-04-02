import { AlbumContext, AlbumUserPlugin, mergeConfig } from "@albumjs/album/server"
import { cjsImporterToEsm, resolveFilePath } from "@albumjs/tools/node"
import viteReactPlugin from "@vitejs/plugin-react-swc"
import { readFile, writeFile } from "fs/promises"
import { resolve, sep } from "path"
import { build as viteBuild } from "vite"
import { pluginInitFile } from "./initFile.js"
import { pluginPatchFile } from "./patchFile.js"
import { buildReactRoutes } from "./routes.js"

type PluginProps<T> = T extends (props: infer P) => any ? P : never

export type PluginReact = {
  pluginReact?: PluginProps<typeof viteReactPlugin>
}

export default function pluginReact(config?: PluginReact): AlbumUserPlugin {
  const { pluginReact } = config ?? {}
  let albumContext: AlbumContext

  return {
    name: "album:plugin-react",
    config(param) {
      if (!param.config.ssrCompose) return
      param.config = mergeConfig(param.config, {
        ssrCompose: {
          dependencies: ["react", "react/jsx-runtime", "react/jsx-dev-runtime", "react-dom", "react-dom/client", "react-router-dom"]
        }
      })
    },
    async findEntries(config) {
      const { main, mainSSR, inputs } = config
      const { cwd } = inputs
      const [_main, _mainSSR] = await Promise.all([
        resolveFilePath({
          root: cwd,
          name: main ?? "main",
          exts: [".tsx", ".ts"]
        }),
        resolveFilePath({
          root: cwd,
          name: mainSSR ?? "main.ssr",
          exts: [".tsx", ".ts"]
        })
      ])
      config.main = _main
      config.mainSSR = _mainSSR
    },
    context(param) {
      albumContext = param.albumContext
    },
    async initClient(config) {
      const { info, appManager } = config
      const { ssr, inputs } = info
      const { specialModules } = appManager
      const { clientRoutes, serverRoutes } = await buildReactRoutes(inputs.dumpInput, specialModules[0])
      await pluginInitFile(clientRoutes, serverRoutes, config)
      config.realClientInput = resolve(inputs.dumpInput, "main.tsx")
      if (ssr) config.realSSRInput = resolve(inputs.dumpInput, "main.ssr.tsx")
    },
    async patchClient(param) {
      const { info, appManager } = param
      const { inputs } = info
      const { specialModules } = appManager
      const { clientRoutes, serverRoutes } = await buildReactRoutes(inputs.dumpInput, specialModules[0])
      await pluginPatchFile(clientRoutes, serverRoutes, param)
    },
    async serverConfig(params) {
      params.viteConfigs.push({
        name: "plugin-react",
        config: {
          build: {
            emptyOutDir: false
          },
          plugins: [viteReactPlugin(pluginReact) as any]
        }
      })
    },
    async buildEnd() {
      const { ssr, ssrCompose, inputs, outputs, appManager, ssrComposeManager, logger } = albumContext
      if (ssr && ssrCompose) {
        const module = appManager.modules[0]
        if (!module || !module.modulePath) return

        logger.log("正在打包 ssr-compose 前置文件，请耐心等待...", "plugin-react")
        const { dumpInput } = inputs
        const { clientOutDir } = outputs
        const { dependencies } = ssrComposeManager
        await viteBuild({
          mode: "production",
          plugins: [viteReactPlugin(pluginReact)],
          logLevel: "error",
          build: {
            reportCompressedSize: false,
            rollupOptions: {
              external: [...dependencies, "album.dependency"],
              input: resolve(dumpInput, "plugin-react/ssr-compose/browser.ts"),
              output: {
                entryFileNames: `browser.js`
              }
            },
            emptyOutDir: false,
            outDir: clientOutDir
          }
        })
        const browserFilePath = `${clientOutDir}${sep}browser.js`
        const newCode = cjsImporterToEsm(await readFile(browserFilePath, "utf-8"), dependencies)
        await writeFile(browserFilePath, newCode, "utf-8")
        logger.log("生成 ssr-compose 前置文件成功", "plugin-react")
      }
    }
  }
}
