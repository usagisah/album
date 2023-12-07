import { resolve } from "path"
import { isArray, isFunction, isNumber } from "../../utils/check/simple.js"
import { resolveFilePath } from "../../utils/path/resolvePath.js"
import { Obj } from "../../utils/types/types.js"
import { DevInputs } from "../inputs/inputs.type.js"
import { UserConfigServer } from "../userConfig/userConfig.type.js"
import { DevServerConfig } from "./serverConfig.type.js"

export async function createServerConfig(input: DevInputs, conf?: UserConfigServer) {
  const { port, rewrite, appModule, tsconfig } = conf ?? {}
  const { cwd, dumpInput } = input

  const _rewrite: DevServerConfig["rewrite"] = []
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

  let _tsconfig: Obj | string | null = null
  if (_appModule) {
    if (tsconfig) _tsconfig = tsconfig
    else {
      _tsconfig = await resolveFilePath({
        root: cwd,
        prefixes: ["./", "server"],
        name: "tsconfig.server",
        exts: ["json"]
      })
    }
  }

  const appModuleFilename = "main.server.js"
  const _conf: DevServerConfig = {
    port: isNumber(port) ? port : 5173,
    rewrite: _rewrite,
    appModule: {
      filename: appModuleFilename,
      input: _appModule,
      output: resolve(dumpInput, "__server")
    },
    tsconfig: _tsconfig
  }
  return _conf
}
