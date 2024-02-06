import { createLogger } from "vite"
import { ILogger } from "../../logger/logger.type.js"

export function proxyLogger(logger: ILogger) {
  const viteLogger = createLogger()
  viteLogger.info = msg => logger.log(msg, "album")
  viteLogger.error = msg => logger.error(msg, "album")
  viteLogger.warn = msg => logger.warn(msg, "album")
  return viteLogger
}
