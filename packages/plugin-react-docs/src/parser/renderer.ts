import { RendererObject } from "marked"
import { BundledLanguage, BundledTheme, HighlighterGeneric } from "shiki"
import { PARSE_SKIP, numReg, scopeNumReg } from "../constants.js"
import { Category } from "../docs.type.js"
import { parseArgs } from "./parseArgs.js"

export interface RendererOptions {
  highlighter: HighlighterGeneric<BundledLanguage, BundledTheme>
  copyText: string
  className: string
  categoryQueue: Category[]
}

export function renderer({ highlighter, copyText, className, categoryQueue }: RendererOptions): RendererObject {
  return {
    heading(text, level) {
      const r = parseArgs(text)
      const id = r.args[0]?.startsWith("#") ? r.args[0].slice(1) : text
      const res = `<h${level} ${className}="u-h u-h${level}" id="${id}"><span ${className}="text">${r.text}</span><a ${className}="u-h-anchor" href="#${id}">#</a></h${level}>`

      let topCate: Category
      while (level <= (topCate = categoryQueue.at(-1)).level) {
        categoryQueue.pop()
      }
      const cate: Category = { level, label: r.text, children: [] }
      topCate.children.push(cate)
      categoryQueue.push(cate)

      return res
    },
    code(code, lang) {
      const { text: _lang, args } = parseArgs(lang ?? "")

      const lineCode = code.split("\n")
      const highLine = new Set<number>()
      args.forEach(v => {
        if (numReg.test(v)) {
          highLine.add(Number(v))
        } else if (scopeNumReg.test(v)) {
          let [l, r] = v.split("-").map(Number)
          if (l <= r) {
            while (l <= r) {
              highLine.add(Number(l))
              l++
            }
          }
        }
      })

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
          })
        })
      }
      const pure = args.includes("pure")
      if (pure) {
        const lastIndex = lineCode.length + 2 - 1
        const highFirst = highLine.has(0)
        const highLast = highLine.has(lastIndex)
        highLine.delete(0)
        highLine.delete(lastIndex)

        const themeCode = codeToThemeCode([...highLine], code, "text", 1)
        const lineFirst = `<pre><code><span ${className}="line">\`\`\`${_lang}</span></code></pre>`
        const lineLast = `<pre><code><span ${className}="line">\`\`\`</span></code></pre>`
        code = [
          highFirst ? `<span ${className}="u-code-highlighted">${lineFirst}</span>` : lineFirst,
          `<div ${className}="u-code-content" dangerouslySetInnerHTML={{__html: \`${themeCode}\`}}></div>`,
          highLast ? `<span ${className}="u-code-highlighted">${lineLast}</span>` : lineLast
        ].join("")
      } else {
        const themeCode = codeToThemeCode([...highLine], code, _lang, 0)
        code = [
          `<div ${className}="u-code-lang">${_lang}</div>`,
          `<div ${className}="u-code-copy">${copyText}</div>`,
          `<div ${className}="u-code-content" dangerouslySetInnerHTML={{__html: \`${themeCode}\`}}></div>`
        ].join("")
      }

      return `<div ${className}="u-code u-code-${_lang}">${code}</div>`
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
