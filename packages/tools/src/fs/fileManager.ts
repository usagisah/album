import { outputFile } from "fs-extra/esm"
import { mkdir, readFile, rm } from "fs/promises"
import { basename, join } from "path"
import { isBlank, isEmpty, isFunction } from "../check/index.js"

export interface FileManagerOptions {
  root: string
  create?: boolean
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

interface WriteFileOptions {
  fileKey: string
  type: FileType
  path: string
  create?: boolean
  check?: boolean
  value?: string | ((value: string) => any | Promise<any>)
}

export async function createFileManager(options: FileManagerOptions) {
  const { root, create = true } = options
  const files = new Map<string, FileDescription>()

  async function add(type: "dir", path: string, options?: { force?: boolean; create?: boolean }): Promise<void>
  async function add(type: "file", path: string, options?: { value?: string | ((value: string) => any | Promise<any>); force?: boolean; create?: boolean }): Promise<void>
  async function add(type: FileType, path: string, options?: any) {
    if (type !== "dir" && type !== "file") {
      throw `FileManager.add type is must be FileType("dir" | "file")`
    }
    if (path.startsWith("/")) {
      path = path.slice(1)
    }

    const { value, force = true, create = true } = options ?? {}
    const fileKey = buildFileKey(type, path)
    const exist = files.has(fileKey)

    if (force && exist) {
      await del(type, path)
      await write({ fileKey, type, path, value: value ?? "", create })
      return
    }
    if (!exist) {
      await write({ fileKey, type, path, value: value ?? "", create })
      return
    }
  }

  async function write(options: WriteFileOptions) {
    const { fileKey, path, type, check, value, create } = options
    if (check && !files.has(fileKey)) {
      throw `FileManager path-file is not exist. (${path})`
    }

    if (type === "dir") {
      if (create) {
        await mkdir(path, { recursive: true })
      }
      files.set(fileKey, { type: "dir", name: basename(path), path })
      return
    }

    const filepath = join(root, path)
    let fileContent = value + ""
    try {
      if (create) {
        if (isFunction(value)) {
          const file = await readFile(filepath, "utf-8").catch(() => "")
          const res = await value(file)
          if (res === false || isEmpty(res)) {
            return
          }
          fileContent = res + ""
        }
        await outputFile(filepath, fileContent, "utf-8")
      }
      files.set(fileKey, { type: "file", name: basename(path), path })
    } catch (e) {
      console.error(e)
    }
  }

  async function del(type: FileType, path: string) {
    if (path.startsWith("/")) {
      path = path.slice(1)
    }

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
    if (path.startsWith("/")) {
      path = path.slice(1)
    }
    return write({ fileKey: buildFileKey("file", path), type: "file", path, check: true, value: value ?? "", create: true })
  }

  function buildFileKey(type: FileType, path: string) {
    return type + "//" + path
  }

  if (isBlank(root)) {
    throw "FileStruct() 参数path必须是一个不为空的字符串"
  }
  if (create) {
    await mkdir(root, { recursive: true })
  }
  return { add, del, setFile }
}

export type FileManager = Awaited<ReturnType<typeof createFileManager>>
