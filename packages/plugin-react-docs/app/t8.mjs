import { readFile, writeFile } from "fs/promises"
import { use as markedUse } from "marked" //https://marked.js.org/using_pro#renderer
import { getHighlighter, bundledThemes, bundledLanguages } from "shiki" //https://shiki.matsu.io/
import fm from "front-matter"

const copy = `<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4487"><path d="M337.28 138.688a27.968 27.968 0 0 0-27.968 27.968v78.72h377.344c50.816 0 92.032 41.152 92.032 91.968v377.344h78.656a28.032 28.032 0 0 0 27.968-28.032V166.656a28.032 28.032 0 0 0-27.968-27.968H337.28z m441.408 640v78.656c0 50.816-41.216 91.968-92.032 91.968H166.656a92.032 92.032 0 0 1-91.968-91.968V337.28c0-50.816 41.152-92.032 91.968-92.032h78.72V166.656c0-50.816 41.152-91.968 91.968-91.968h520c50.816 0 91.968 41.152 91.968 91.968v520c0 50.816-41.152 92.032-91.968 92.032h-78.72zM166.656 309.312a27.968 27.968 0 0 0-27.968 28.032v520c0 15.424 12.544 27.968 27.968 27.968h520a28.032 28.032 0 0 0 28.032-27.968V337.28a28.032 28.032 0 0 0-28.032-28.032H166.656z" p-id="4488"></path></svg>`

const numReg = /^[0-9]+$/
const scopeNumReg = /^[0-9]+-[0-9]+$/
const highlighter = await getHighlighter({
  themes: Object.keys(bundledThemes),
  langs: Object.keys(bundledLanguages)
})
const content = await readFile("./xxx.md", "utf-8")
const skip = "\0" + Date.now()
const html = markedUse({
  hooks: {
    preprocess(md) {
      const { attributes, body } = fm(md)
      return body
    }
  },
  extensions: [
    {
      name: "block",
      level: "inline",
      tokenizer(code) {
        const nextLine = code.indexOf("\n")
        const end = code.indexOf(":::", 3)
        if (end === -1 || end < nextLine) {
          return false
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
        const buildBlock = (cls, title, body) => {
          const code = []
          if (title) code.push(`<p class="u-block-title">${title}</p>`)
          if (body) code.push(`<p class="u-block-msg">${body}</p>`)
          return `<div class="u-block u-block-plain u-block-${cls}">${code.join(
            ""
          )}</div>`
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
            return skip + body
          }
          case "details": {
            return `<details class="u-block u-block-plain u-block-details"><summary class="u-block-title">${title}</summary><p class="u-block-msg">${body}</p></details>`
          }
          default: {
            const title = cls.length > 0 ? cls : args[0]
            return buildBlock("info", title, body)
          }
        }
      }
    }
  ],
  renderer: renderer(highlighter)
}).parse(content)

/* --------------  -------------- */
/**
 * @param {string} code
 */
function parseArgs(code) {
  const s = code.indexOf("{")
  const e = s === -1 ? -1 : code.lastIndexOf("}")
  if (s === -1 || e === -1) {
    return { text: code, args: [] }
  }
  const args = code
    .slice(s + 1, e)
    .split(/\s*,\s*/g)
    .filter(v => v.length > 0)
  const text = code.slice(0, s).trimEnd()
  return { text, args }
}

/* --------------  -------------- */
/**
 *
 * @param {*} highlighter
 * @returns {import("marked").RendererObject}
 */
function renderer(highlighter) {
  return {
    heading(text, level) {
      const r = parseArgs(text)
      const id = r.args[0]?.startsWith("#") ? r.args[0].slice(1) : text
      return `<h${level} class="u-h u-h${level}" id="${id}"><span class="text">${r.text}</span><a class="u-h-anchor" href="#${id}">#</a></h${level}>`
    },
    code(code, lang) {
      const { text: _lang, args } = parseArgs(lang)
      
      const pure = args.includes("pure")
      if (pure) {
        const themeCode = highlighter.codeToHtml(code, {
          lang: "text",
          theme: "vitesse-light"
        })
        code = `<pre><code><span class="line">\`\`\`${lang}</span></code></pre>\n${themeCode}\n<pre><code><span class="line">\`\`\`</span></code></pre>`
      } else {
        const themeCode = highlighter.codeToHtml(code, {
          lang: _lang,
          theme: "vitesse-light"
        })
        code = `<div class="u-code-lang">${_lang}</div><div class="u-code-copy">${copy}</div>\n${themeCode}`
      }

      const highLine = new Set()
      args.forEach(v => {
        if (numReg.test(v)) {
          highLine.add(Number(v))
        }
        else if (scopeNumReg.test(v)) {
          let [l, r] = v.split("-")
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
            lines[useIndex] = `<div class="u-code-highlighted">${lines[useIndex]}</div>`
          }
        })
        code = lines.join("\n")
      }
      return `<div class="u-code u-code-${_lang}">${code}</div>`
    },
    hr() {
      return `<div class="u-hr"></div>`
    },
    html(html, block) {
      if (html.startsWith("<br")) {
        return `<div class="u-br"></div>`
      }
      return html
    },
    paragraph(text) {
      if (text.startsWith(skip)) {
        return text.slice(skip.length)
      }
      return `<p class="u-line">${text}</p>`
    },
    blockquote(quote) {
      return `<div class="u-blockquote">${quote}</div>`
    },
    list(body, ordered, start) {
      if (!ordered) {
        return `<ul class="u-list u-ul">${body}</ul>`
      }

      return `<ol class="u-list u-ol">${body}</ol>`
    },
    table(header, body) {
      return `<table class="u-table">${header}${body}</table>`
    },

    /* --------------  -------------- */
    strong(text) {
      return `<strong class="u-strong">${text}</strong>`
    },
    codespan(text) {
      return `<div class="u-line-code">${text}</div>`
    },
    link(href, title, text) {
      return `<a class="u-a" target="_blank" href="${href}" title="${title}">${text}</a>`
    },
    image(href, title, text) {
      return `<img class="u-img" src="${href}" title="${title}" />`
    },
    br() {
      return `<p class="u-br"></p>`
    }
  }
}

/* --------------  -------------- */
writeFile(
  "./article.html",
  `<link rel="stylesheet" href="./article.md.css"><div class="u-container">${html}</div>`,
  "utf-8"
)
