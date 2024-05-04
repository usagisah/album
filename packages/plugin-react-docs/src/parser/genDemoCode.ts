import { AlbumContext } from "@albumjs/album/server"
import { outputFileSync } from "@albumjs/tools/lib/fs-extra"
import { resolve } from "path"
import { MDDemo } from "src/docs.type.js"

let count = 0
export function genDemoCode(demos: MDDemo[], { inputs }: AlbumContext, code: string) {
  const { dumpInput } = inputs
  const id = count++
  const name = `Comp${id}.tsx`
  const outPath = resolve(dumpInput, `plugin-react-docs/demos/${name}`)
  outputFileSync(outPath, code, { encoding: "utf-8" })

  demos.push({ name: name.slice(0, -4), filepath: outPath })

  return id
}
