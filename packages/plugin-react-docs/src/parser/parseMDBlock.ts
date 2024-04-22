import { AlbumContext } from "@albumjs/album/server"
import { TokenizerAndRendererExtension } from "marked"
import { BundledLanguage, BundledTheme, HighlighterGeneric } from "shiki"
import { Category } from "../docs.type.js"
import { genDemoCode } from "./genDemoCode.js"
import { parseArgs } from "./parseArgs.js"
import { renderCode } from "./renderer.js"

export interface BlockExtensionConfig {
  highlighter: HighlighterGeneric<BundledLanguage, BundledTheme>
  copyText: string
  className: string
  categoryQueue: Category[]
  albumContext: AlbumContext
}

export function blockExtension({ highlighter, copyText, className, albumContext }: BlockExtensionConfig): TokenizerAndRendererExtension {
  return {
    name: "block",
    level: "block",
    tokenizer(code) {
      if (!code.trimStart().startsWith(":::")) {
        return
      }

      const start = code.indexOf(":::")
      const nextLine = code.indexOf("\n", start + 1)
      const end = code.indexOf(":::", nextLine + 1)
      if (end === -1 || end < nextLine) {
        return
      }

      const line = code.slice(start + 3, nextLine)
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
      const title = args[0] ?? _cls.toLowerCase()
      const buildBasicBlock = (cls: string, title: string, body: string) => {
        const code = []
        if (title) code.push(`<div ${className}="u-block-title">${title}</div>`)
        if (body) code.push(`<div ${className}="u-block-msg">${body}</div>`)
        return `<div ${className}="u-block u-block-plain u-block-${cls}">${code.join("")}</div>`
      }
      switch (_cls) {
        case "tabs": {
          const shouldRender = args.includes("render")
          const codes = resolveBlockCodes(body)

          let id = undefined
          const tabItems: string[] = []
          codes.map((item, index) => {
            if (shouldRender && index === 0 && ["tsx", "jsx"].includes(item._lang)) {
              id = genDemoCode(albumContext, item.code)
            }
            const themeCode = renderCode({
              code: item.code,
              lang: item.lang,
              renderOptions: { highlighter, className, copyText, categoryQueue: [], albumContext },
              canRender: false
            })
            tabItems.push(`<div data-label="${item._args[0] ?? item._lang}">${themeCode}</div>`)
          })
          return `<DemoBox client={${id ? `resolveDemoClientPath?.(${id})` : "''"}} server={${id ? `resolveDemoNodePath?.(${id})` : "''"}}>${tabItems.join("")}</DemoBox>`
        }
        case "info":
        case "tip":
        case "warn":
        case "danger":
        case "important": {
          return buildBasicBlock(_cls, title, body)
        }
        case "raw": {
          return body
        }
        case "details": {
          return `<details ${className}="u-block u-block-plain u-block-details"><summary ${className}="u-block-title">${title}</summary><div ${className}="u-block-msg">${body}</div></details>`
        }
        default: {
          const title = cls.length > 0 ? cls : args[0]
          return buildBasicBlock("info", title, body)
        }
      }
    }
  }
}

function resolveBlockCodes(body: string) {
  const codes: { lang: string; code: string; _lang: string; _args: string[] }[] = []
  while (true) {
    const start = body.indexOf("```")
    if (start === -1) break

    const nextLine = body.indexOf("\n")
    if (nextLine === -1) {
      throw `检测到异常 block 格式：\n${body}`
    }

    const end = body.indexOf("```", nextLine + 1)
    if (end === -1) {
      throw `检测到异常 block 格式：\n${body}`
    }

    const lang = body.slice(start + 3, nextLine)
    const { args, text } = parseArgs(lang)
    codes.push({ lang, code: body.slice(nextLine + 1, end).trim(), _args: args, _lang: text })
    body = body.slice(end + 3).trim()
  }
  return codes
}
