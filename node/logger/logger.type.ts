import { format } from "winston"
import { DailyRotateFileTransportOptions } from "winston-daily-rotate-file"

export type { LoggerService as ILogger } from "@nestjs/common"
export type { Logger as WinstonLogger } from "winston"
export type { DailyRotateFileTransportOptions } from "winston-daily-rotate-file"
export type LoggerParams = {
  type?: "winston"
  level?: string
  enableConsole?: boolean
  consoleFormat?: ReturnType<typeof format.printf>
  enableFile?: boolean
  fileOptions?: DailyRotateFileTransportOptions | ((options: DailyRotateFileTransportOptions) => DailyRotateFileTransportOptions)
}

export { format, transports } from "winston"
