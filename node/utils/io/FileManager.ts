import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs"
import { resolve } from "path"
import { isString } from "../check/check.js"

const GAP = "//"

function joinName(type: FileType, name: string) {
  return type + GAP + name
}

export type FileType = "file" | "dir"

type GetFileReturn<T extends FileType> = T extends "dir" ? DirStruct | undefined : T extends "file" ? FileStruct | undefined : never

export class FileStruct {
  #type: "file" = "file"
  #name: string
  #value: string
  #path: string

  constructor(params: { name: string; path: string; value: string }) {
    const { name, path, value } = params
    if (!isString(name) || name.length === 0 || !isString(path) || !isString(value)) {
      throw false
    }
    this.#name = name
    this.#path = path
    this.#value = value
    writeFileSync(path, value, "utf-8")
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

  update(value: string) {
    if (!isString(value)) {
      return false
    }
    try {
      writeFileSync(this.#path, value, "utf-8")
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

  constructor(params: { name: string; path: string; create?: boolean }) {
    const { name, path, create } = params
    if (!isString(name) || name.length === 0 || !isString(path)) {
      throw false
    }

    this.#name = name
    this.#path = path

    if (create !== false && !existsSync(this.#path)) {
      mkdirSync(this.#path, { recursive: true })
    }
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

  keys() {
    return [...this.#files.keys()].map(n => n.split(GAP))
  }

  values() {
    return this.#files
  }

  get<T extends FileType>(type: T, filePaths: string): GetFileReturn<T> {
    if (!isString(filePaths)) {
      return
    }

    const names = filePaths.split("/").filter(Boolean)
    const target = names.length - 1
    let files = this.#files
    for (let index = 0; index < names.length; index++) {
      const n = names[index]
      if (index === target) {
        return files.get(joinName(type as FileType, n)) as any
      }

      files = (files.get(joinName("dir", n)) as DirStruct).values()
      if (!files) return
    }
  }

  remove(type: FileType, filePaths: string | string[]): boolean {
    if (isString(filePaths)) {
      filePaths = filePaths.split("/").filter(Boolean)
    }
    if (!Array.isArray(filePaths) || filePaths.length === 0) {
      return
    }

    if (filePaths.length > 1) {
      const dir = this.#files.get(joinName("dir", filePaths[0])) as DirStruct
      return dir ? dir.remove(type, filePaths.slice(1)) : false
    }

    const key = joinName(type, filePaths[0])
    const file = this.#files.get(key)
    if (file) {
      rmSync(file.path)
      this.#files.delete(key)
      return true
    }
    return false
  }

  add(type: FileType, filePaths: string | string[], value = ""): boolean {
    if (isString(filePaths)) {
      filePaths = filePaths.split("/").filter(Boolean)
    }
    if (!Array.isArray(filePaths) || filePaths.length === 0) {
      return
    }

    if (filePaths.length > 1) {
      const name = filePaths[0]
      const key = joinName("dir", name)
      let file = this.#files.get(key)
      if (!file || file.type !== "dir") {
        file = new DirStruct({
          name,
          path: resolve(this.path, name)
        })
        this.#files.set(key, file)
      }
      return file.add(type, filePaths.slice(1), value)
    }

    if (type === "file") {
      const name = filePaths[0]
      const file = new FileStruct({
        name,
        path: resolve(this.path, name),
        value
      })
      this.#files.set(joinName(type, name), file)
      return true
    }

    const key = joinName(type, filePaths[0])
    const dir = this.#files.get(key)
    if (!dir || dir.type !== "dir") return false

    const name = filePaths[1]
    if (type === "dir") {
      const dir = new DirStruct({
        name,
        path: resolve(this.path, name)
      })
      this.#files.set(joinName(type, name), dir)
      return true
    }

    if (type === "file") {
      const file = new FileStruct({
        name,
        path: resolve(this.path, name),
        value
      })
      this.#files.set(joinName(type, name), file)
      return true
    }

    return false
  }
}
