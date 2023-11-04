import { Injectable, LogLevel } from "@nestjs/common"
import { Logger } from "./logger.js"
import { ILogger } from "./logger.type.js"

@Injectable()
export class AlbumLoggerService implements ILogger {
  constructor() {
    if (!Logger.logger) {
      throw new Error("请不要在初始化 album server 前尝试创建 AlbumLoggerService")
    }
  }
  log(message: any, ...optionalParams: any[]) {
    Logger.logger.log(message, ...optionalParams)
  }
  error(message: any, ...optionalParams: any[]) {
    Logger.logger.error(message, ...optionalParams)
  }
  warn(message: any, ...optionalParams: any[]) {
    Logger.logger.warn(message, ...optionalParams)
  }
  debug?(message: any, ...optionalParams: any[]) {
    Logger.logger.debug(message, ...optionalParams)
  }
  verbose(message: any, ...optionalParams: any[]) {
    Logger.logger.verbose(message, ...optionalParams)
  }
  fatal(message: any, ...optionalParams: any[]) {
    throw new Error("Method not implemented.")
  }
  setLogLevels(levels: LogLevel[]) {
    throw new Error("Method not implemented.")
  }
}
