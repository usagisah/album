import { TokenizerAndRendererExtension } from "marked"
import { PARSE_SKIP } from "../constants.js"
import { parseArgs } from "./parseArgs.js"

export interface BlockExtensionConfig {
  className: string
}

export function blockExtension({ className }: BlockExtensionConfig): TokenizerAndRendererExtension {
  return {
    name: "block",
    level: "inline",
    tokenizer(code) {
      const nextLine = code.indexOf("\n")
      const end = code.indexOf(":::", 3)
      if (end === -1 || end < nextLine) {
        return
      }

      const line = code.slice(3, nextLine)
      const { args, text } = parseArgs(line)
      return {
        raw: code.slice(0, end + 3),
        type: "block",
        args,
        cls: text.trim(),
        body: code.slice(nextLine + 1, end).trim()
      }
    },
    renderer({ cls, args, body }) {
      const _cls = cls.toLowerCase()
      const title = args[0] ?? _cls.toUpperCase()
      const buildBlock = (cls: string, title: string, body: string) => {
        const code = []
        if (title) code.push(`<div ${className}="u-block-title">${title}</div>`)
        if (body) code.push(`<div ${className}="u-block-msg">${body}</div>`)
        return `<div ${className}="u-block u-block-plain u-block-${cls}">${code.join("")}</div>`
      }
      switch (_cls) {
        case "info":
        case "tip":
        case "warn":
        case "danger":
        case "important": {
          return buildBlock(_cls, title, body)
        }
        case "raw": {
          return PARSE_SKIP + body
        }
        case "details": {
          return `<details ${className}="u-block u-block-plain u-block-details"><summary ${className}="u-block-title">${title}</summary><div ${className}="u-block-msg">${body}</div></details>`
        }
        default: {
          const title = cls.length > 0 ? cls : args[0]
          return buildBlock("info", title, body)
        }
      }
    }
  }
}
