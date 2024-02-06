import { LoggerParams } from "./logger.type.js"

export async function createAlbumLogger(config?: LoggerParams) {
  if (config?.type === "winston") {
    return new (await import("./winston.js")).WinstonLogger(config)
  }
  return new (await import("./terminal.js")).TerminalLogger()
}
