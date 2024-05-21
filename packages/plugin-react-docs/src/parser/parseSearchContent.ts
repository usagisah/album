import { SearchMdContent } from "../docs.type.js"

const titleReg = /(#+)([^\n]+)/

export function parseSearchContent(filename: string, text: string) {
  const contents: SearchMdContent[] = []
  while (text.length > 0) {
    text = text.trimStart()

    if (text.startsWith("#")) {
      let [line, level, title] = text.match(titleReg)
      title = title.trim()
      if (title.length === 0) {
        continue
      }
      text = text.slice(line.length)

      let index = text.indexOf("\n#")
      if (index === -1) {
        index = text.length
      }
      const val = text.slice(0, index).trim()
      contents.push({ level: Number(level), title, text: val })
      text = text.slice(index)
      continue
    }

    if (contents.length === 0) {
      const index = text.indexOf("\n#")
      let val: string
      if (index > -1) {
        val = text.slice(0, index).trim()
        text = text.slice(index)
      } else {
        val = text.trim()
        text = ""
      }
      contents.push({ title: filename, text: val })
      continue
    }

    throw "未知的情况"
  }
  return contents
}
