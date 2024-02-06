import { Obj, isNumber, isPlainObject, isString, readJson, resolveFilePath } from "@albumjs/tools/node"
import { resolve } from "path"
import { Inputs } from "../context/context.dev.type.js"
import { UserConfigServer } from "../user/user.dev.type.js"
import { ServerManager } from "./server.dev.type.js"

export async function createServerManager(input: Inputs, userConfigServer?: UserConfigServer) {
  const { port, appModule, tsconfig } = userConfigServer ?? {}
  const { cwd, dumpInput } = input

  let _appModule: string | null = null
  if (appModule) _appModule = appModule
  else {
    _appModule = await resolveFilePath({
      root: cwd,
      prefixes: ["./", "src", "server"],
      name: "main.server",
      exts: ["ts"]
    })
  }

  let _tsconfig: Obj | null = null
  if (_appModule) {
    if (isPlainObject(tsconfig)) _tsconfig = tsconfig
    if (isString(tsconfig)) {
      const configPath = await resolveFilePath({
        root: cwd,
        prefixes: ["./", "server"],
        name: "tsconfig.server",
        exts: ["json"]
      })
      if (configPath) _tsconfig = await readJson(configPath)
    }
  }

  const appModuleFilename = "main.server.js"
  const manager: ServerManager = {
    port: isNumber(port) ? port : 5173,
    appModule: {
      filename: appModuleFilename,
      input: _appModule,
      output: resolve(dumpInput, "__server")
    },
    tsconfig: _tsconfig
  }
  return manager
}
