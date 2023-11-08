import { UserConfigServer } from "../userConfig/userConfig.type.js"
import { ServerConfig } from "./serverConfig.type.js"
export function createServerConfig(conf?: UserConfigServer) {
  const _conf: ServerConfig = {
    port: conf?.port ?? 5173
  }
  return _conf
}
