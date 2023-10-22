import { dirname } from "path"
import { fileURLToPath } from "url"
export function createModulePath(fileUrl: string) {
  const __filename = fileURLToPath(fileUrl)
  const __dirname = dirname(__filename)
  return { __filename, __dirname }
}
