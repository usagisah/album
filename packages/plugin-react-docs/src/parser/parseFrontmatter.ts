import { Obj } from "@albumjs/tools/node"
import yml from "js-yaml"

export interface MDFrontmatter {
  value: Obj
  bodyBegin: number
}

export function parseFrontmatter(fileContent: string, bodyOnly?: boolean) {
  const res: MDFrontmatter = { value: {}, bodyBegin: 0 }
  if (!fileContent.startsWith("---")) {
    return res
  }

  const e = fileContent.indexOf("---", 3)
  if (e === -1) {
    return res
  }

  res.bodyBegin = e + 3
  if (bodyOnly) {
    return res
  }

  res.value = yml.load(fileContent.slice(3, e))
  return res
}
