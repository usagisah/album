import { watch } from "@albumjs/tools/lib/chokidar"
import { NodeArgs, waitPromiseAll } from "@albumjs/tools/node"
import { resolve, sep } from "path"
import { createAppManager } from "../app/appManager.dev.js"
import { registryEnv } from "../env/env.dev.js"
import { ILogger } from "../logger/logger.type.js"
import { createServerManager } from "../server/serverManager.dev.js"
import { ServerMode } from "../service/service.type.js"
import { loadConfig } from "../user/loadConfig.dev.js"
import { AlbumContext, Inputs, Outputs } from "./context.dev.type.js"
import { createFileManager } from "./fileManager.dev.js"

export type ContextParams = {
  SYSTEM_RESTART: string
  appId: string
  serverMode: ServerMode
  args: NodeArgs
  config?: string
}

export async function createContext(params: ContextParams): Promise<AlbumContext> {
  let _logger: ILogger = console
  try {
    const { appId, serverMode, args, SYSTEM_RESTART, config } = params
    const cwd = process.cwd()
    const dumpInput = resolve(cwd, ".album")
    const albumConfigInput = config ?? resolve(cwd, "album.config.ts")
    const inputs: Inputs = { cwd, root: cwd, dumpInput, albumConfigInput }

    const { userConfig, pluginManager, logger } = await loadConfig({ args, inputs, serverMode })
    _logger = logger

    const watcher = watch([albumConfigInput], {
      persistent: true,
      ignorePermissionErrors: true,
      useFsEvents: true,
      ignoreInitial: true,
      usePolling: false,
      alwaysStat: false
    })
    watcher.on("change", p => {
      if (p === albumConfigInput) {
        process.stderr.write(SYSTEM_RESTART)
      }
    })

    const ssrCompose = !!userConfig.ssrCompose
    const [env, appManager, serverManager] = await waitPromiseAll([
      registryEnv(serverMode, inputs, userConfig.env),
      createAppManager({
        appId,
        inputs,
        pluginManager,
        ssrCompose,
        userConfigApp: userConfig.app
      }),
      createServerManager(inputs, userConfig.server)
    ])
    const ssr = !!appManager.mainSSRInput
    const fileManager = createFileManager(ssr, ssrCompose, inputs)

    // outputs
    const baseOutDir = `${cwd}${sep}dist`
    const outDir = resolve(baseOutDir, appId === "default" ? "" : appId)
    const apiOutDir = serverManager.appModule.input ? `${outDir}${sep}api` : ""
    let clientOutDir = ""
    let ssrOutDir = ""
    if (ssr) {
      clientOutDir = `${outDir}${sep}client`
      ssrOutDir = `${outDir}${sep}ssr`
    } else {
      clientOutDir = outDir
    }
    const outputs: Outputs = { baseOutDir, outDir, clientOutDir, ssrOutDir, apiOutDir }

    return {
      appId,
      serverMode,
      ssr,
      ssrCompose,
      inputs,
      outputs,
      env,

      fileManager,
      clientManager: { ready: Promise.resolve(true) },

      appManager,
      serverManager,
      ssrComposeManager: null,
      pluginManager,
      userConfig,

      logger,
      watcher,
      viteDevServer: null as any,

      getStaticInfo: () => ({ appId, serverMode, ssr, ssrCompose, inputs, outputs, env })
    }
  } catch (e) {
    _logger.error(e, "album")
    throw e
  }
}
