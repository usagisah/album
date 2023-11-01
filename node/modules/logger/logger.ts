import { ILogger } from "./logger.type.js"

export class Logger implements ILogger {
  color = {
    green: (text: string) => `\x1B[32m${text}\x1B[39m`,
    yellow: (text: string) => `\x1B[33m${text}\x1B[39m`,
    red: (text: string) => `\x1B[31m${text}\x1B[39m`,
    bgRed: (t: string) => `\x1b[41m${t}\x1b[41m`,
    bgGreen: (t: string) => `\x1b[42m${t}\x1b[42m`
  }

  log(message: any, ...optionalParams: any[]) {
    this.formatMessage([message], optionalParams, "info", "green")
  }

  error(message: any, ...optionalParams: any[]) {
    this.formatMessage([message], optionalParams, "error", "red")
  }

  warn(message: any, ...optionalParams: any[]) {
    this.formatMessage([message], optionalParams, "warn", "yellow")
  }

  debug?(message: any, ...optionalParams: any[]) {
    this.formatMessage([message], optionalParams, "debug", "bgRed")
  }

  verbose?(message: any, ...optionalParams: any[]) {
    this.formatMessage([message], optionalParams, "verbose", "bgGreen")
  }

  formatMessage(messages: any[], params: any[], level: string, color: string) {
    let context = ""
    if (typeof params.at(-1) === "string") {
      context = params.at(-1)
      params = params.slice(0, -1)
    }

    this.printMessage(context, [...messages, ...params], level, color)
  }

  printMessage(context: string, messages: any[], level: string, color: string) {
    const msg = messages.join(" ")
    const c = (this.color as any)[color]
    const t = new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "numeric",
      second: "numeric"
    }).format(new Date())
    process.stdout.write(`${c("[" + level + "]")} ${this.color.red(t)} ${c("{" + context + "}")} -> ${c(msg)} \n`)
  }
}
