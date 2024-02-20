import { outputFile } from "fs-extra/esm"
import { mkdir, readFile, rm } from "fs/promises"
import { basename, join } from "path"
import { isBlank, isEmpty, isFunction } from "../check/index.js"

export interface FileManagerOptions {
  root: string
}

export type FileType = "dir" | "file"

export interface FileDescription {
  type: string
  name: string
  path: string
}

export interface FileTreeNode extends FileDescription {
  children: FileTreeNode[]
}

export async function createFileManager(options: FileManagerOptions) {
  const { root } = options
  const files = new Map<string, FileDescription>()

  async function add(type: "dir", path: string, options?: { force?: boolean }): Promise<void>
  async function add(type: "file", path: string, options?: { value?: string | ((value: string) => any | Promise<any>); force?: boolean }): Promise<void>
  async function add(type: FileType, path: string, options?: any) {
    if (type !== "dir" && type !== "file") {
      throw `FileManager.add type is must be FileType("dir" | "file")`
    }
    if (path.startsWith("/")) {
      path = path.slice(1)
    }

    const { value, force = false } = options ?? {}
    const fileKey = buildFileKey(type, path)
    const exist = files.has(fileKey)

    if (force && exist) {
      await del(type, path).then(() => write({ fileKey, type, path, value }))
    } else if (!exist) {
      await write({ fileKey, type, path, value })
    }
  }

  async function write(options: { fileKey: string; type: FileType; path: string; check?: boolean; value?: string | ((value: string) => any | Promise<any>) }) {
    const { fileKey, path, type, check, value } = options
    if (check && !files.has(fileKey)) {
      throw `FileManager path-file is not exist`
    }

    if (type === "dir") {
      await mkdir(path, { recursive: true })
      files.set(fileKey, { type: "dir", name: basename(path), path })
      return
    }

    const filepath = join(root, path)
    let fileContent = value as string
    try {
      if (isFunction(value)) {
        const file = await readFile(filepath, "utf-8")
        const res = await value(file)
        if (res === false || isEmpty(res)) {
          return
        }
        fileContent = res + ""
      }
      await outputFile(filepath, fileContent, "utf-8")
      files.set(fileKey, { type: "file", name: basename(path), path })
    } catch (e) {
      console.error(e)
    }
  }

  async function del(type: FileType, path: string) {
    const fileKey = buildFileKey(type, path)
    const description = files.get(fileKey)
    if (description) {
      await rm(description.path, { force: true, recursive: true })
      removeSubFiles(path)
    }
  }
  function removeSubFiles(prePath: string) {
    const delFiles: string[] = []
    files.forEach(({ type, path }) => {
      if (path.startsWith(prePath)) {
        delFiles.push(buildFileKey(type as FileType, path))
      }
    })
    delFiles.map(k => files.delete(k))
  }

  async function setFile(path: string, value: string | ((value: string) => any | Promise<any>)) {
    return write({ fileKey: buildFileKey("file", path), type: "file", path, check: true, value })
  }

  function buildFileKey(type: FileType, path: string) {
    return type + "//" + path
  }

  if (isBlank(root)) {
    throw "FileStruct() 参数path必须是一个不为空的字符串"
  }
  await mkdir(root, { recursive: true })
  return { add, del, setFile }
}
