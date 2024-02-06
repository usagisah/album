import { isFunction, isPlainObject } from "@albumjs/tools/node"
import { resolve } from "path"
import { createLogger, format, transports } from "winston"
import "winston-daily-rotate-file"
import { formatConsoleMessage } from "./format.js"
import { DailyRotateFileTransportOptions, ILogger, LoggerParams } from "./logger.type.js"

export class WinstonLogger implements ILogger {
  static logger: WinstonLogger
  private logger: any

  constructor(params: LoggerParams = {}) {
    if (WinstonLogger.logger) return WinstonLogger.logger
    const { level = "info", enableConsole = true, consoleFormat, enableFile = false, fileOptions } = params
    const _transports: any[] = []
    if (enableConsole) {
      _transports.push(
        new transports.Console({
          format:
            consoleFormat ??
            format.printf(info => {
              const messages = [info.message, ...(info[Symbol.for("splat")] ?? [])]
              const context = messages.length > 1 && typeof messages.at(-1) === "string" ? messages.pop() : null
              return formatConsoleMessage(info.level, context, messages)
            })
        })
      )
    }
    if (enableFile) {
      let options = isPlainObject(fileOptions)
        ? fileOptions
        : {
            level,
            dirname: resolve(process.cwd(), "logs"),
            filename: "assets.%DATE%.log",
            datePattern: "YYYY-MM-DD",
            maxSize: "1g",
            zippedArchive: false,
            maxFiles: "1d",
            format: format.simple()
          }
      if (isFunction(fileOptions)) {
        const res = fileOptions(options as any)
        if (isPlainObject(res)) options = res
      }
      _transports.push(new transports.DailyRotateFile(options as DailyRotateFileTransportOptions))
    }

    this.logger = createLogger({
      level,
      transports: _transports
    })
    WinstonLogger.logger = this
  }

  log(message: any, ...optionalParams: any[]) {
    this.logger.info(message, ...optionalParams)
  }

  error(message: any, ...optionalParams: any[]) {
    this.logger.error(message, ...optionalParams)
  }

  warn(message: any, ...optionalParams: any[]) {
    this.logger.warn(message, ...optionalParams)
  }

  debug(message: any, ...optionalParams: any[]) {
    this.logger.debug(message, ...optionalParams)
  }

  verbose(message: any, ...optionalParams: any[]) {
    this.logger.verbose(message, ...optionalParams)
  }
}
