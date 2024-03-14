import { readFile } from "fs/promises"
import { dirname, resolve } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const templates = new Map<string, string>()

export async function renderTemplate(filePath: string, params: Record<string, any>, format?: boolean) {
  let file = templates.get(filePath)
  if (!file) {
    file = await readFile(resolve(__dirname, "../templates/" + filePath), "utf-8")
    templates.set(filePath, file)
  }
  for (const key in params) {
    file = file.replace(new RegExp(`(let __var__${key})|(__var__${key})|("__ref__${key}")`, "g"), params[key])
  }

  return file
}
