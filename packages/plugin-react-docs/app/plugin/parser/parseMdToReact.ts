import fm from "front-matter"
import { use } from "marked" //https://marked.js.org/using_pro#renderer
import { bundledLanguages, bundledThemes, getHighlighter } from "shiki" //https://shiki.matsu.io/
import { DEFAULT_COPY_TEXT } from "../constants"
import { blockExtension } from "./blockExtension"
import { renderer } from "./renderer"

export interface ParseConfig {
  copyText?: string
  className?: string
}

export async function parseMdToReact(mdContent: string, config: ParseConfig) {
  const { className = "className", copyText = DEFAULT_COPY_TEXT } = config
  const highlighter = await getHighlighter({
    themes: Object.keys(bundledThemes),
    langs: Object.keys(bundledLanguages),
  })
  let frontmatter: Record<string, string> = {}
  const html = await use({
    hooks: {
      preprocess(md) {
        const { attributes, body } = fm(md)
        frontmatter = attributes as any
        return body
      }
    },
    extensions: [blockExtension({ className })],
    renderer: renderer({ highlighter, copyText: copyText, className })
  }).parse(mdContent)
  return { html, frontmatter }
}
