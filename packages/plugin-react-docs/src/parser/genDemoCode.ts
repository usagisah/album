import { AlbumContext } from "@albumjs/album/server"
import { outputFileSync } from "@albumjs/tools/lib/fs-extra"
import { resolve } from "path"

let count = 0
export function genDemoCode({ inputs }: AlbumContext, code: string) {
  const { dumpInput } = inputs
  const id = count++
  const name = `Comp${id}.tsx`
  const outPath = resolve(dumpInput, `plugin-react-docs/demos/${name}`)
  outputFileSync(outPath, code, { encoding: "utf-8" })
  return id
}
