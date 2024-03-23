import { AppSpecialModule, AppSpecialModuleDir, AppSpecialModuleFile } from "@albumjs/album/server"
import { red } from "@albumjs/tools/lib/colorette"
import { hash3 } from "@albumjs/tools/lib/murmurhash"
import { Obj } from "@albumjs/tools/node"
import fm from "front-matter"
import { readFile } from "fs/promises"
import { resolve } from "path"
import { pathToRegexp } from "path-to-regexp"
import { MDRecord, PluginContext } from "../docs.type.js"

type ParseOptions = {
  parentPath: string
  context: PluginContext
  promises: Promise<any>[]
}

export async function parseModules(specialModules: AppSpecialModule[], context: PluginContext) {
  const promises: Promise<any>[] = []
  const options = { parentPath: "", context, promises }
  nextModules(specialModules, options)
  await Promise.all(options.promises)
}

async function parseFile(module: AppSpecialModule, options: ParseOptions) {}

function nextFiles(files: (AppSpecialModuleDir | AppSpecialModuleFile)[]) {}

function nextModules(specialModules: AppSpecialModule[], options: ParseOptions) {
  const { parentPath, context, promises } = options
  const { outDir, records, recordMap } = context
  for (const module of specialModules) {
    promises.push(
      (async () => {
        const { files, filename, filepath, dirs, children } = module
        const fileContent = await readFile(filepath, "utf-8")
        const hash = hash3(fileContent)
        const routePath = parentPath + filename
        const routePathReg = pathToRegexp(parentPath + filename, null, { sensitive: false })
        const outPath = resolve(outDir, "." + filename)
        let frontmatter: Obj = {}
        try {
          frontmatter = (fm as any)(fileContent).attributes
        } catch (e) {
          console.error(red(`plugin-react-docs: 预解析文件元信息失败, 请检查书写格式是否错误, 文件路径: ${filepath}`))
          console.error(e)
        }
        const record: MDRecord = {
          filename,
          filepath,
          hash,
          outPath,
          routePath: routePathReg,
          frontmatter
        }
        records.push(record)
        recordMap.set(filepath, record)

        nextModules(children, { context, promises, parentPath: routePath })
        nextFiles(files)
        nextFiles(dirs)
      })()
    )
  }
}
