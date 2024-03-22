import { RendererObject } from "marked"
import { BundledLanguage, BundledTheme, HighlighterGeneric } from "shiki"
import { PARSE_SKIP, numReg, scopeNumReg } from "../constants"
import { parseArgs } from "./parseArgs"

export interface RendererOptions {
  highlighter: HighlighterGeneric<BundledLanguage, BundledTheme>
  copyText: string
  className: string
}

export function renderer({ highlighter, copyText, className }: RendererOptions): RendererObject {
  return {
    heading(text, level) {
      const r = parseArgs(text)
      const id = r.args[0]?.startsWith("#") ? r.args[0].slice(1) : text
      return `<h${level} ${className}="u-h u-h${level}" id="${id}"><span ${className}="text">${r.text}</span><a ${className}="u-h-anchor" href="#${id}">#</a></h${level}>`
    },
    code(code, lang) {
      const { text: _lang, args } = parseArgs(lang ?? "")

      const pure = args.includes("pure")
      if (pure) {
        const themeCode = highlighter.codeToHtml(code, {
          lang: "text",
          theme: "vitesse-light"
        })
        code = `<pre><code><span ${className}="line">\`\`\`${lang}</span></code></pre>\n${themeCode}\n<pre><code><span ${className}="line">\`\`\`</span></code></pre>`
      } else {
        const themeCode = highlighter.codeToHtml(code, {
          lang: _lang,
          theme: "vitesse-light",
          transformers: [{
            
          }]
        })
        code = `<div ${className}="u-code-lang">${_lang}</div><div ${className}="u-code-copy">${copyText}</div>\n<div dangerouslySetInnerHTML={{__html: \`${themeCode}\`}}></div>`
      }

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
      if (highLine.size > 0) {
        const lines = code.split("\n")
        const base = pure ? 0 : 1
        highLine.forEach(index => {
          if (index > 0 && index <= lines.length) {
            const useIndex = index - 1 + base
            lines[useIndex] = `<div ${className}="u-code-highlighted">${lines[useIndex]}</div>`
          }
        })
        code = lines.join("\n")
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
      return `<table ${className}="u-table">${header}${body}</table>`
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
      return `<img ${className}="u-img" src="${href}" title="${title}" />`
    },
    br() {
      return `<div ${className}="u-br"></div>`
    }
  }
}
