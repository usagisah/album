import { readFile } from "fs/promises"
import { Obj } from "../types/types.js"

export async function readJson(path: string) {
  try {
    const res = await readFile(path, "utf-8")
    return JSON.parse(res) as Obj
  } catch(e) {
    return null
  }
}
