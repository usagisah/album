import { AppSpecialModule, AppSpecialModuleDir, AppSpecialModuleFile } from "@albumjs/album/server"
import { red } from "@albumjs/tools/lib/colorette"
import { hash3 } from "@albumjs/tools/lib/murmurhash"
import { readFile } from "fs/promises"
import { resolve } from "path"
import { pathToRegexp } from "path-to-regexp"
import { MDRecord, PluginContext } from "../docs.type.js"
import { parseFrontmatter } from "./parseFrontmatter.js"

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

async function parseFile(filepath: string) {
  const fileContent = await readFile(filepath, "utf-8")
  const hash = hash3(fileContent)
  let frontmatter = { value: {}, bodyBegin: 0 }
  try {
    frontmatter = parseFrontmatter(fileContent)
  } catch (e) {
    console.error(red(`plugin-react-docs: 预解析文件元信息失败, 请检查书写格式是否错误`))
    if (filepath) {
      console.error(red(`文件路径: ${filepath}`))
    }

    console.error(e)
  }
  return { hash, frontmatter }
}

function nextFiles(files: (AppSpecialModuleDir | AppSpecialModuleFile)[], options: ParseOptions) {
  const { promises, context } = options
  for (const item of files) {
    if (item.type === "dir") {
      nextFiles(item.files, options)
      continue
    }

    if (item.ext !== "md") {
      continue
    }

    promises.push(
      (async () => {
        const res = await parseFile(item.filepath)
        const record = { ...res, filename: item.filename, filepath: item.filepath }
        context.recordMap.set(item.filepath, record)
        context.records.push(record)
      })()
    )
  }
}

function nextModules(specialModules: AppSpecialModule[], options: ParseOptions) {
  const { parentPath, context, promises } = options
  const { outDir, records, recordMap } = context
  for (const module of specialModules) {
    promises.push(
      (async () => {
        const { files, filename, filepath, dirs, children } = module
        const mdInfo = await parseFile(filepath)
        const routePath = parentPath + filename
        const routePathReg = pathToRegexp(parentPath + filename, null, { sensitive: false })
        const outPath = resolve(outDir, "." + filename)
        const record: MDRecord = {
          ...mdInfo,
          filename,
          filepath,
          outPath,
          routePath: routePathReg
        }
        records.push(record)
        recordMap.set(filepath, record)

        nextModules(children, { context, promises, parentPath: routePath })
        nextFiles(files, options)
        nextFiles(dirs, options)
      })()
    )
  }
}
