import { Injectable, LogLevel } from "@nestjs/common"
import { Logger } from "./logger.js"
import { ILogger } from "./logger.type.js"

@Injectable()
export class AlbumLoggerService implements ILogger {
  log(message: any, ...optionalParams: any[]) {
    this.getLogger().log(message, ...optionalParams)
  }

  error(message: any, ...optionalParams: any[]) {
    this.getLogger().error(message, ...optionalParams)
  }

  warn(message: any, ...optionalParams: any[]) {
    this.getLogger().warn(message, ...optionalParams)
  }

  debug?(message: any, ...optionalParams: any[]) {
    this.getLogger().debug!(message, ...optionalParams)
  }

  verbose(message: any, ...optionalParams: any[]) {
    this.getLogger().verbose!(message, ...optionalParams)
  }

  fatal(message: any, ...optionalParams: any[]) {
    throw new Error("Method not implemented.")
  }

  setLogLevels(levels: LogLevel[]) {
    throw new Error("Method not implemented.")
  }

  getLogger(): ILogger {
    throw "(AlbumLoggerService) 未初始化的 album builtin getLogger"
  }
}

export function createAlbumLoggerService(logger: ILogger) {
  AlbumLoggerService.prototype.getLogger = () => logger
  return AlbumLoggerService
}
