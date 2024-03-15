import { readFile, writeFile } from "fs/promises"
import { use as markedUse } from "marked" //https://marked.js.org/using_pro#renderer
import { resolve } from "path"
import { getHighlighter, bundledThemes, bundledLanguages } from "shiki" //https://shiki.matsu.io/
//shiki
// Override function
const tokenizer = {
  paragraph(src) {
    if (src.startsWith(":::")) {
      const closeIndex = src.indexOf(":::", 3)
      if (closeIndex === -1) {
        return
      }

      const content = src.slice(3, closeIndex)
      const nextLine = content.indexOf("\n")
      if (nextLine === -1) {
        return
      }

      return {
        type: "block",
        text: content.slice(nextLine + 1, closeIndex),
        meta: content.slice(3, nextLine).trim().split(",").filter(Boolean),
        raw: src.slice(0, closeIndex + 3)
      }
    }
  }
}
class Catalog {
  node = { l: -1, title: "", children: [], parent: null }

  add(level, title) {
    const { l, parent, children } = this.node

    if (l === -1 || level > l) {
      const node = (this.node = {
        l: level,
        title,
        children: [],
        parent: this.node
      })
      children.push(node)
      return
    }

    if (level === l) {
      const node = (this.node = { l: level, title, children: [], parent })
      parent.children.push(node)
      return
    }

    this.node = parent
    this.add(level, title)
  }

  normalize(nodes) {
    const result = []
    for (const node of nodes) {
      result.push({
        l: node.l,
        title: node.title,
        children: this.normalize(node.children)
      })
    }
    return result
  }

  result() {
    while (this.node.l != -1) {
      this.node = this.node.parent
    }

    const r = this.node.children
    this.node.children = null
    return this.normalize(r)
  }
}

const highlighter = await getHighlighter({
  themes: Object.keys(bundledThemes),
  langs: Object.keys(bundledLanguages),
})

const renderer = catalog => {
  return {
    heading(text, level) {
      catalog?.add(level, text)
      return `<h${level} class="u-h u-h${level}" id="${text}">${text}</h${level}>`
    },
    code(code, infoString) {
      return `<div class="u-code u-code-${infoString}">${highlighter.codeToHtml(code, {
        lang: infoString,
        theme: "nord"
      })}</div>`
    },
    hr() {
      return `<div class="u-hr"></div>`
    },
    html(html, block) {
      return block ? `<div class="u-line">${html}</div>` : html
    },
    paragraph(text) {
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

const catalog = new Catalog()
const result = markedUse({
  tokenizer,
  renderer: renderer(catalog),
  extensions: [
    {
      name: "block",
      renderer({ text, meta }) {
        // return `\n\n<h1>${raw.replaceAll("\n", "~~")}</h1>\n\n`
        return `\n<Block type="${meta[0]}">${text}</Block>\n`
      }
    }
  ]
}).parse(await readFile(resolve("xxx.md"), "utf-8"))
writeFile(resolve("xx.html"), result, "utf8")
