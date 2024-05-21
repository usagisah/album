import Fuse from "fuse.js"

const max_len = 25
const pre_len = 5
function sliceKeywords(text: string, start: number, end: number) {
  // 禁止换行
  const matched = text.slice(start, end)
  const keyNextLineIndex = matched.indexOf("\n")
  if (keyNextLineIndex > -1) {
    end = keyNextLineIndex
  }

  // 只在所在行匹配
  let prevLine = text.lastIndexOf("\n", start)
  if (prevLine === -1) prevLine = -1
  let nextLine = text.indexOf("\n", end)
  if (nextLine === -1) nextLine = text.length

  // 小于最大匹配数量直接返回
  const line = text.slice(prevLine + 1, nextLine)
  if (line.length <= max_len) {
    return line
  }

  // 找到前置下标，不允许小于上个换行
  // 前置位置不够时，找到差数 sn 补到末尾
  let s = start - pre_len
  let sn = 0
  if (s < pre_len) {
    sn = prevLine - s
    s = prevLine
  }

  // 找到后置位置，不允许大于下个换行
  const e = Math.min(sn + end + max_len - (end - start) - pre_len, nextLine)

  // 如果实际长度小于最大匹配长度，尝试从前边找补
  if (e - s < max_len) {
    s = Math.max(prevLine, e - max_len)
  }

  return text.slice(s, e)
}

const docs = await fetch("/assets/_searchContentMap")
  .then(v => v.json())
  .then(res => {
    const docs: { title: string; text: string; route: string }[] = []
    res.forEach(({ route, contents }: any) => {
      contents.forEach((c: any) => {
        docs.push({ ...c, route })
      })
    })
    return docs
  })

const fuse = new Fuse(docs, {
  includeScore: true,
  keys: ["title", "text"],
  shouldSort: true,
  findAllMatches: true,
  includeMatches: true
})

self.onmessage = async e => {
  const data: { searchVal: string } = JSON.parse(e.data)
  const searchRes = fuse.search(data.searchVal)
  const res = searchRes.map(({ item, matches }) => {
    const { title, route } = item
    const href = route + "/" + title
    return matches!.map(({ key, indices }) => {
      if (key === "title") {
        return { title, href, text: "" }
      }
      return { title, href, text: sliceKeywords(item.text, indices[0][0], indices[0][1]) }
    })
  })
  self.postMessage(JSON.stringify({ matched: res.flat() }))
}
