import { mkdir, rm } from "fs/promises"

export async function emptyDir(dirPath: string) {
  await rm(dirPath, { force: true, recursive: true })
  return mkdir(dirPath, { recursive: true })
}
