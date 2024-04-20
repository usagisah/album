import { AlbumContext } from "@albumjs/album/server"
import { Obj } from "@albumjs/tools/node"
import { RendererObject } from "marked"
import { BundledLanguage, BundledTheme, HighlighterGeneric } from "shiki"
import { PARSE_SKIP, numReg, scopeNumReg } from "../constants.js"
import { Category } from "../docs.type.js"
import { genDemoCode } from "./genDemoCode.js"
import { parseArgs } from "./parseArgs.js"

export interface RendererOptions {
  highlighter: HighlighterGeneric<BundledLanguage, BundledTheme>
  copyText: string
  className: string
  categoryQueue: Category[]
  albumContext: AlbumContext
}

export function renderer(options: RendererOptions): RendererObject {
  const { className, categoryQueue } = options
  return {
    heading(text, level) {
      const r = parseArgs(text)
      const id = r.args[0]?.startsWith("#") ? r.args[0].slice(1) : text
      const res = `<h${level} ${className}="u-h u-h${level}" id="${id}"><span ${className}="text">${r.text}</span><a ${className}="u-h-anchor" href="#${id}">#</a></h${level}>`

      let topCate: Category
      while (level <= (topCate = categoryQueue.at(-1)).level) {
        categoryQueue.pop()
      }
      const cate: Category = { level, label: r.text, link: "#" + id, children: [] }
      topCate.children.push(cate)
      categoryQueue.push(cate)

      return res
    },
    code(code, lang) {
      return renderCode({ code, lang, renderOptions: options })
    },
    hr() {
      return `<div ${className}="u-hr"></div>`
    },
    html(html, block) {
      if (html.startsWith("<br")) {
        return `<div ${className}="u-br"></div>`
      }
      return html
    },
    paragraph(text) {
      if (text.startsWith(PARSE_SKIP)) {
        return text.slice(PARSE_SKIP.length)
      }
      return `<div ${className}="u-line">${text}</div>`
    },
    blockquote(quote) {
      return `<div ${className}="u-blockquote">${quote}</div>`
    },
    list(body, ordered, start) {
      if (!ordered) {
        return `<ul ${className}="u-list u-ul">${body}</ul>`
      }

      return `<ol ${className}="u-list u-ol">${body}</ol>`
    },
    table(header, body) {
      return `<table ${className}="u-table"><thead>${header}</thead><tbody>${body}</tbody></table>`
    },

    /* --------------  -------------- */
    strong(text) {
      return `<strong ${className}="u-strong">${text}</strong>`
    },
    codespan(text) {
      return `<div ${className}="u-line-code">${text}</div>`
    },
    link(href, title, text) {
      return `<a ${className}="u-a" target="_blank" href="${href}" title="${title}">${text}</a>`
    },
    image(href, title, text) {
      return `<img ${className}="u-img" src="${href}" title="${title}" alt="${text}" onError={onImageLodeError} />`
    },
    br() {
      return `<div ${className}="u-br"></div>`
    }
  }
}

export type RenderCodeOptions = {
  code: string
  lang: string
  renderOptions: RendererOptions
  canRender?: boolean
}
export function renderCode(options: RenderCodeOptions) {
  let { code, lang, renderOptions, canRender = true } = options
  let { className, copyText, highlighter, albumContext } = renderOptions

  const originCode = code
  const { text: _lang, args } = parseArgs(lang ?? "")
  const lineCode = code.split("\n")
  const hightLines = resolveHighLines(args)

  const codeToThemeCode = (highLine: number[], code: string, lang: string, shouldSubLine: number) => {
    return highlighter.codeToHtml(code, {
      lang: lang,
      themes: {
        light: "vitesse-light",
        dark: "vitesse-dark"
      },
      decorations: highLine.map(index => {
        const lineIndex = index - shouldSubLine
        return {
          start: { line: lineIndex, character: 0 },
          end: { line: lineIndex, character: lineCode[lineIndex]?.length },
          properties: { class: "u-code-highlighted" }
        }
      }),
      transformers: [
        {
          span(node) {
            node.children.forEach(child => {
              if (child.type === "text") {
                child.value = child.value.replace(/(\{|\}|<|>)/g, `{"$1"}`)
              }
            })
          }
        }
      ]
    })
  }

  const pure = args.includes("pure")
  if (pure) {
    const lastLineIndex = lineCode.length + 2 - 1
    const isHighFirst = hightLines.has(0)
    const isHighLast = hightLines.has(lastLineIndex)
    hightLines.delete(0)
    hightLines.delete(lastLineIndex)

    const themeCode = codeToThemeCode([...hightLines], code, "text", 1)
    const themeFirstLine = `<pre><code><span ${className}="line">\`\`\`${_lang}</span></code></pre>`
    const themeLastLine = `<pre><code><span ${className}="line">\`\`\`</span></code></pre>`

    code = [
      isHighFirst ? `<span ${className}="u-code-highlighted">${themeFirstLine}</span>` : themeFirstLine,
      `<div ${className}="u-code-content">${themeCode}</div>`,
      isHighLast ? `<span ${className}="u-code-highlighted">${themeLastLine}</span>` : themeLastLine
    ].join("")
  } else {
    const themeCode = codeToThemeCode([...hightLines], code, _lang, 0)
    code = `<div ${className}="u-code-content">${themeCode}</div>`
  }

  let themeCode = [
    `<div ${className}="u-code u-code-${_lang}">`,
    `<div ${className}="u-code-lang">${_lang}</div>`,
    `<div ${className}="u-code-copy" onClick={copy}>${copyText}</div>`,
    `<div ${className}="u-code-wrapper">${code}</div>`,
    `</div>`
  ].join("")

  themeCode = themeCode.replace(/\s{1}class="(.*?)"/g, ` ${className}="$1"`)
  themeCode = themeCode.replace(/\s{1}style="(.*?)"/g, (_, content: string) => {
    if (content.startsWith("{{") && content.endsWith("}}")) {
      return `style=${content}`
    }

    const style: Obj = {}
    content.split(";").map(item => {
      let [k, v] = item.split(":")
      k = k.trim()
      v = v.trim()

      if (k.startsWith("--")) {
        style[k] = v
      } else {
        style[k.replace(/-([a-z])/g, (_, char) => char.toUpperCase())] = v
      }
    })
    return ` style={${JSON.stringify(style, null, 2)}}`
  })

  if (canRender && args.includes("render")) {
    const id = ["jsx", "tsx"].includes(_lang) ? genDemoCode(albumContext, originCode) : undefined
    const isRenderComp = typeof id === "number"
    return `<DemoBox client={${isRenderComp ? `resolveDemoClientPath?.(${id})` : "''"}} server={${isRenderComp ? `resolveDemoNodePath?.(${id})` : "''"}}><div data-label="">${themeCode}</div></DemoBox>`
  }
  return themeCode
}

function resolveHighLines(args: string[]) {
  const highLines = new Set<number>()
  args.forEach(v => {
    if (numReg.test(v)) {
      highLines.add(Number(v))
    } else if (scopeNumReg.test(v)) {
      let [l, r] = v.split("-").map(Number)
      if (l <= r) {
        while (l <= r) {
          highLines.add(Number(l))
          l++
        }
      }
    }
  })
  return highLines
}
