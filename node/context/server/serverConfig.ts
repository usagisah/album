import { isArray, isFunction, isNumber } from "../../utils/check/simple.js"
import { UserConfigServer } from "../userConfig/userConfig.type.js"
import { ServerConfig } from "./serverConfig.type.js"
export function createServerConfig(conf?: UserConfigServer) {
  const { port, rewrite } = conf ?? {}

  const _port = isNumber(port) ? port : 5173

  const _rewrite: ServerConfig["rewrite"] = []
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

  const _conf: ServerConfig = {
    port: _port,
    rewrite: _rewrite
  }
  return _conf
}
