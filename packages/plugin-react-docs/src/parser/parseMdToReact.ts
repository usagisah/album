import { use } from "marked" //https://marked.js.org/using_pro#renderer
import { bundledLanguages, bundledThemes, getHighlighter } from "shiki" //https://shiki.matsu.io/
import { DEFAULT_COPY_TEXT } from "../constants.js"
import { blockExtension } from "./extension.js"
import { parseFrontmatter } from "./parseFrontmatter.js"
import { renderer } from "./renderer.js"

export interface ParseMDConfig {
  copyText?: string
  className?: string
}

export async function parseMdToReact(mdContent: string, config: ParseMDConfig) {
  const { className = "className", copyText = DEFAULT_COPY_TEXT } = config
  const highlighter = await getHighlighter({
    themes: Object.keys(bundledThemes),
    langs: Object.keys(bundledLanguages)
  })
  const html = await use({
    hooks: {
      preprocess(fileContent) {
        return fileContent.slice(parseFrontmatter(fileContent).bodyBegin)
      }
    },
    extensions: [blockExtension({ className })],
    renderer: renderer({ highlighter, copyText: copyText, className })
  }).parse(mdContent)
  return html
}
