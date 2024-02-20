import { formatConsoleMessage } from "./format.js"
import { ILogger } from "./logger.type.js"

export class TerminalLogger implements ILogger {
  static logger: TerminalLogger

  constructor() {
    TerminalLogger.logger = this
  }

  log(message: any, ...optionalParams: any[]) {
    this.print("log", message, optionalParams)
  }

  error(message: any, ...optionalParams: any[]) {
    this.print("error", message, optionalParams)
  }

  warn(message: any, ...optionalParams: any[]) {
    this.print("warn", message, optionalParams)
  }

  debug(message: any, ...optionalParams: any[]) {
    this.print("debug", message, optionalParams)
  }

  verbose(message: any, ...optionalParams: any[]) {
    this.print("verbose", message, optionalParams)
  }

  print(type: string, message: any, optionalParams: any[]) {
    const messages = [message, ...optionalParams]
    const context = messages.length > 1 && typeof messages.at(-1) === "string" ? messages.pop() : null
    process[type === "error" ? "stderr" : "stdout"].write(formatConsoleMessage(type, context, messages))
  }
}
