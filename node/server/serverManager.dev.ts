import { resolve } from "path"
import { Inputs } from "../context/context.dev.type.js"
import { UserConfigServer } from "../user/user.dev.type.js"
import { isArray, isFunction, isNumber, isPlainObject, isString } from "../utils/check/simple.js"
import { readJson } from "../utils/fs/readJson.js"
import { resolveFilePath } from "../utils/path/resolvePath.js"
import { Obj } from "../utils/types/types.js"
import { ServerManager, ServerManagerRewrite } from "./server.dev.type.js"

export async function createServerManager(input: Inputs, userConfigServer?: UserConfigServer) {
  const { port, rewrite, appModule, tsconfig } = userConfigServer ?? {}
  const { cwd, dumpInput } = input

  const _rewrite: ServerManagerRewrite = []
  if (isArray(rewrite)) {
    for (const rule of rewrite) {
      if (isFunction(rule)) _rewrite.push(rule)
      else {
        for (const key in rule) {
          const fnBody = ["const {path} = req", `if (path === ${key}) return ${rule[key]}`]
          _rewrite.push(new Function("req", fnBody.join("\n")) as any)
        }
      }
    }
  }

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
    rewrite: _rewrite,
    appModule: {
      filename: appModuleFilename,
      input: _appModule,
      output: resolve(dumpInput, "__server")
    },
    tsconfig: _tsconfig
  }
  return manager
}
