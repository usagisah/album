import { Module } from "@nestjs/common"
import { readFile, writeFile } from "fs/promises"

export async function loadRootModule(input?: string | null) {
  let appModule: any
  if (input) {
    const code = await readFile(input, "utf-8")
    await writeFile(input, `const module = {exports: {}};export default module;` + code)
    const m = await (await import(`${input}?a=${new Date().getTime()}`)).default.exports
    appModule = await m.default({})
  } else {
    @Module({})
    class AppModule {}
    appModule = AppModule
  }
  return appModule
}
