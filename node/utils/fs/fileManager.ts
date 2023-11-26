import { existsSync } from "fs"
import { mkdir, rm, writeFile } from "fs/promises"
import { resolve } from "path"
import { z } from "zod"
import { isString } from "../check/simple.js"

const GAP = "//"

function buildFileKey(type: FileType, name: string) {
  return type + GAP + name
}

export type FileType = "file" | "dir"

export class FileStruct {
  #type: "file" = "file"
  #name: string
  #value: string
  #path: string

  constructor(params: { name: string; path: string; value: string }) {
    const { name, path, value } = params
    z.string().min(1).parse(name)
    z.string().min(1).parse(path)
    this.#name = name
    this.#path = path
    this.#value = value
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

  get value() {
    return this.#value
  }

  async create() {
    await writeFile(this.#path, this.#value, "utf-8")
    return this
  }

  async update(value: string) {
    if (!isString(value)) return false
    try {
      await writeFile(this.#path, value, "utf-8")
      return true
    } catch {
      return false
    }
  }
}

export class DirStruct {
  #type: "dir" = "dir"
  #name: string
  #path: string
  #files = new Map<string, FileStruct | DirStruct>()

  constructor(params: { name: string; path: string }) {
    const { name, path } = params
    z.string().min(1).parse(name)
    z.string().min(1).parse(path)

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

  async create(overwrite = false) {
    const exist = existsSync(this.#path)
    if (!exist) await mkdir(this.#path)
    if (exist && overwrite) {
      await rm(this.#path, { recursive: true, force: true })
      await mkdir(this.#path)
    }
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

  async add(type: FileType, filePaths: string | string[], value = ""): Promise<boolean> {
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
        }).create()
        this.#files.set(key, file)
      }
      return file.add(type, filePaths.slice(1), value)
    }

    const key = buildFileKey(type, filePaths[0])
    if (this.#files.get(key)) return false

    const name = filePaths[0]
    type === "file"
      ? this.#files.set(
          key,
          await new FileStruct({
            name,
            path: resolve(this.path, name),
            value
          }).create()
        )
      : this.#files.set(
          key,
          await new DirStruct({
            name,
            path: resolve(this.path, name)
          }).create()
        )

    return true
  }
}
