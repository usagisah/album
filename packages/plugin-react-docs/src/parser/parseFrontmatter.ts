import { Obj } from "@albumjs/tools/node"
import yml from "js-yaml"

export interface MDFrontmatter {
  value: Obj
  bodyBegin: number
}

export function parseFrontmatter(fileContent: string) {
  const res: MDFrontmatter = { value: {}, bodyBegin: 0 }
  if (!fileContent.startsWith("---")) {
    return res
  }

  const e = fileContent.indexOf("---", 3)
  if (e === -1) {
    return res
  }

  res.value = yml.load(fileContent.slice(3, e))
  res.bodyBegin = e + 3
  return res
}
