import { watch } from "chokidar"
import { resolve, sep } from "path"
import { createAppManager } from "../app/appManager.dev.js"
import { ServerMode } from "../cli/cli.type.js"
import { registryEnv } from "../env/env.dev.js"
import { ILogger } from "../modules/logger/logger.type.js"
import { createServerManager } from "../server/serverManager.dev.js"
import { createSSRComposeManager } from "../ssrCompose/ssrComposeManager.dev.js"
import { loadConfig } from "../user/loadConfig.dev.js"
import { NodeArgs } from "../utils/command/args.js"
import { waitPromiseAll } from "../utils/promises/waitPromiseAll.js"
import { AlbumContext, Inputs, Outputs } from "./context.dev.type.js"
import { createFileManager } from "./fileManager.dev.js"

export type ContextParams = {
  appId: string
  serverMode: ServerMode
  args: NodeArgs
}

export async function createContext(params: ContextParams): Promise<AlbumContext> {
  let _logger: ILogger = console
  try {
    const { appId, serverMode, args } = params

    const cwd = process.cwd()
    const dumpInput = `${cwd}${sep}.album`
    const albumConfigInput = `${cwd}${sep}album.config.ts`
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

    const ssrCompose = !!userConfig.ssrCompose
    const [{ appFileManager, dumpFileManager }, env, appManager, serverManager] = await waitPromiseAll([
      createFileManager(inputs),
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
    const ssrComposeManager = await createSSRComposeManager({
      inputs,
      watcher,
      appManager,
      userConfigSSRCompose: userConfig.ssrCompose,
      userConfig,
      logger
    })

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

      appFileManager,
      dumpFileManager,
      appManager,
      serverManager,
      ssrComposeManager,
      pluginManager,
      userConfig,

      logger,
      watcher,
      viteDevServer: null as any,

      getStaticInfo: () => ({ appId, serverMode, ssr, ssrCompose, inputs, outputs, env })
    }
  } catch (e) {
    _logger.error(e, "album")
    process.exit(1)
  }
}
