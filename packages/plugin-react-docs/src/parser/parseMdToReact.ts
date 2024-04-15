import { AlbumContext } from "@albumjs/album/server"
import { use } from "marked" //https://marked.js.org/using_pro#renderer
import { bundledLanguages, bundledThemes, getHighlighter } from "shiki" //https://shiki.matsu.io/
import { DEFAULT_COPY_TEXT } from "../constants.js"
import { Category } from "../docs.type.js"
import { blockExtension } from "./parseMDBlock.js"
import { renderer } from "./renderer.js"

export interface ParseMDConfig {
  copyText?: string
  className?: string
}

export async function parseMdToReact(mdContent: string, config: ParseMDConfig, albumContext: AlbumContext) {
  const { className = "className", copyText = DEFAULT_COPY_TEXT } = config
  const highlighter = await getHighlighter({ themes: Object.keys(bundledThemes), langs: Object.keys(bundledLanguages) })
  const categoryQueue: Category[] = [{ level: -1, label: "", link: "", children: [] }]
  return {
    componentContent: await use({
      extensions: [blockExtension({ highlighter, copyText: copyText, className, categoryQueue, albumContext })],
      renderer: renderer({ highlighter, copyText: copyText, className, categoryQueue, albumContext })
    }).parse(mdContent),
    category: categoryQueue[0].children
  }
}
