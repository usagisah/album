import { AlbumContext } from "@albumjs/album/server"
import { Obj } from "@albumjs/tools/node"
import { h } from "hastscript"
import { RendererObject } from "marked"
import { BundledLanguage, BundledTheme, HighlighterGeneric } from "shiki"
import { numReg, scopeNumReg } from "../constants.js"
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
  const hightLines = resolveHighLines(args)

  const codeToThemeCode = (code: string, lang: string) => {
    return highlighter.codeToHtml(code, {
      lang: lang,
      themes: {
        light: "vitesse-light",
        dark: "vitesse-dark"
      },
      transformers: [
        {
          span(node) {
            node.children.forEach(child => {
              if (child.type === "text") {
                child.value = "{`" + child.value.replace(/`/g, "\\`") + "`}"
              }
            })
          },
          line(hast, line) {
            if (hightLines.has(line)) {
              hast.children = [h("div", { [className]: "u-code-highlighted" }, hast.children)]
            }
          },
          postprocess(html, options) {
            return html
              .replace(/\s{1}class="(.*?)"/g, ` ${className}="$1"`)
              .replace(/\s{1}style="(.*?)"/g, (_, content: string) => {
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
              .replace(/(&#x3C;)/g, "<")
          }
        }
      ]
    })
  }

  if (args.includes("pure")) {
    code = codeToThemeCode(`\`\`\`\n${code}\n\`\`\``, "text")
  } else {
    code = codeToThemeCode(code, _lang)
  }

  let themeCode = [
    `<div ${className}="u-code u-code-${_lang}">`,
    `<div ${className}="u-code-lang">${_lang}</div>`,
    `<div ${className}="u-code-copy" onClick={copy}>${copyText}</div>`,
    `<div ${className}="u-code-wrapper"><div ${className}="u-code-content">${code}</div></div>`,
    `</div>`
  ].join("")

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
