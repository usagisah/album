import { existsSync } from "fs"
import { mkdir, readFile, rm, writeFile } from "fs/promises"
import { basename, resolve } from "path"
import { isEmpty, isFunction, isString, isStringEmpty } from "../check/simple.js"
import { Func } from "../types/types.js"

const GAP = "//"

function buildFileKey(type: FileType, name: string) {
  return type + GAP + name
}

export type FileType = "file" | "dir"

export class FileStruct {
  #type: "file" = "file"
  #name: string
  #path: string

  constructor(params: { path: string }) {
    const { path } = params
    if (isStringEmpty(path)) throw "new FileStruct() 参数path必须是一个不为空的字符串"
    this.#name = basename(path)
    this.#path = path
  }

  get type() {
    return this.#type
  }

  get name() {
    return this.#name
  }

  get path() {
    return this.#path
  }

  async read() {
    return await readFile(this.#path, "utf-8").catch(() => "")
  }

  async write(value: string, force?: boolean): Promise<FileStruct>
  async write(fn: Func<[string]>, force?: boolean): Promise<FileStruct>
  async write(param: any, force = true): Promise<any> {
    if (existsSync(this.#path) && !force) return this

    let content = ""
    if (isString(param)) content = param
    else if (isFunction(param)) {
      const res = await param(await this.read())
      if (res === false || isEmpty(res)) return this
      content = res + ""
    } else throw "FileStruct.write() 参数不是合法值，请传递一个文件内容字符串或函数"
    await writeFile(this.#path, content, "utf-8")
    return this
  }
}

export class DirStruct {
  #type: "dir" = "dir"
  #name: string
  #path: string
  #files = new Map<string, FileStruct | DirStruct>()

  constructor(params: { path: string }) {
    const { path } = params
    if (isStringEmpty(path)) throw "new FileStruct() 参数path必须是一个不为空的字符串"
    this.#name = basename(path)
    this.#path = path
  }

  get type() {
    return this.#type
  }

  get name() {
    return this.#name
  }

  get path() {
    return this.#path
  }

  async write(force = false) {
    if (existsSync(this.#path)) {
      if (force) await rm(this.#path, { recursive: true, force: true })
      else return this
    }
    await mkdir(this.#path, { recursive: true })
    return this
  }

  keys() {
    return [...this.#files.keys()].map(n => n.split(GAP))
  }

  values() {
    return this.#files
  }

  toJSON(): any {
    return Array.from(this.#files).map(([key, value]) => {
      return value.type === "file" ? { path: value.path, name: value.name } : [key, value.toJSON()]
    })
  }

  get<T extends FileType>(type: T, filePaths: string): (T extends "file" ? FileStruct : DirStruct) | null {
    if (!isString(filePaths)) return null
    const names = filePaths.split("/").filter(Boolean)
    const target = names.length - 1
    let files = this.#files
    for (let index = 0; index < names.length; index++) {
      const n = names[index]
      if (index === target) {
        const res: any = files.get(buildFileKey(type as FileType, n))
        return res ?? null
      }

      const _file = files.get(buildFileKey("dir", n))
      if (!_file || _file.type !== "dir") return null
      files = _file.values()
    }
    return null
  }

  async remove(type: FileType, filePaths: string | string[]): Promise<boolean> {
    if (isString(filePaths)) {
      filePaths = filePaths.split("/").filter(Boolean)
    }
    if (!Array.isArray(filePaths) || filePaths.length === 0) {
      return false
    }

    if (filePaths.length > 1) {
      const dir = this.#files.get(buildFileKey("dir", filePaths[0])) as DirStruct
      return dir ? dir.remove(type, filePaths.slice(1)) : false
    }

    const key = buildFileKey(type, filePaths[0])
    const file = this.#files.get(key)
    if (file) {
      await rm(file.path)
      this.#files.delete(key)
      return true
    }
    return false
  }

  async add(options: { type: FileType; file: string | string[]; value?: string | Func<[string]>; force?: boolean }): Promise<boolean> {
    let { type, file: filePaths, value = "", force } = options
    if (!["file", "dir"].includes(type)) return false
    if (isString(filePaths)) filePaths = filePaths.split("/").filter(v => v.length > 0)
    if (!Array.isArray(filePaths) || filePaths.length === 0) return false

    if (filePaths.length > 1) {
      const name = filePaths[0]
      const key = buildFileKey("dir", name)
      let file = this.#files.get(key) as DirStruct
      if (!file) {
        file = new DirStruct({ path: resolve(this.path, name) })
        this.#files.set(key, file)
        await file.write()
      }
      return file.add({ type, file: filePaths.slice(1), value, force })
    }

    const key = buildFileKey(type, filePaths[0])
    if (this.#files.get(key)) return false

    const name = filePaths[0]
    let fileIns: FileStruct | DirStruct
    if (type === "file") {
      fileIns = new FileStruct({ path: resolve(this.path, name) })
      await fileIns.write(value as any, force)
    } else {
      fileIns = new DirStruct({ path: resolve(this.path, name) })
      await fileIns.write(force)
    }
    this.#files.set(key, fileIns)
    return true
  }
}
