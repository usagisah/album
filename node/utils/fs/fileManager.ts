import { existsSync } from "fs"
import { mkdir, readFile, rm, writeFile } from "fs/promises"
import { resolve } from "path"
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

  constructor(params: { name: string; path: string }) {
    const { name, path } = params
    if (isStringEmpty(name)) throw "new FileStruct() 参数name必须是一个不为空的字符串"
    if (isStringEmpty(path)) throw "new FileStruct() 参数path必须是一个不为空的字符串"
    this.#name = name
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

  async write(value: string): Promise<FileStruct>
  async write(fn: Func<[string]>): Promise<FileStruct>
  async write(param: any): Promise<any> {
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

  constructor(params: { name: string; path: string }) {
    const { name, path } = params
    if (isStringEmpty(name)) throw "new FileStruct() 参数name必须是一个不为空的字符串"
    if (isStringEmpty(path)) throw "new FileStruct() 参数path必须是一个不为空的字符串"
    this.#name = name
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
    let exist = existsSync(this.#path)
    if (exist && force) {
      await rm(this.#path, { recursive: true, force: true })
      exist = false
    }
    if (!exist) await mkdir(this.#path)
    return this
  }

  keys() {
    return [...this.#files.keys()].map(n => n.split(GAP))
  }

  values() {
    return this.#files
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

  async add(type: FileType, filePaths: string | string[], value: string | Func<[string]> = ""): Promise<boolean> {
    if (!["file", "dir"].includes(type)) return false
    if (isString(filePaths)) filePaths = filePaths.split("/").filter(v => v.length > 0)
    if (!Array.isArray(filePaths) || filePaths.length === 0) return false
    if (filePaths.length > 1) {
      const name = filePaths[0]
      const key = buildFileKey("dir", name)
      let file = this.#files.get(key)
      if (!file || file.type !== "dir") {
        file = await new DirStruct({
          name,
          path: resolve(this.path, name)
        }).write()
        this.#files.set(key, file)
      }
      return file.add(type, filePaths.slice(1), value)
    }

    const key = buildFileKey(type, filePaths[0])
    if (this.#files.get(key)) return false

    const name = filePaths[0]
    let fileIns: FileStruct | DirStruct
    if (type === "file") fileIns = await new FileStruct({ name, path: resolve(this.path, name) }).write(value as any)
    else fileIns = await new DirStruct({ name, path: resolve(this.path, name) }).write()
    this.#files.set(key, fileIns)

    return true
  }
}
