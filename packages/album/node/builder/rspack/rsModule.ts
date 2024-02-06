import { Module } from "@nestjs/common"
import { readFile, writeFile } from "fs/promises"

const OVERWRITE = "/*album-overwrite*/"
export async function rsModuleRewrite(input: string) {
  const code = await readFile(input, "utf-8")
  if (code.startsWith(OVERWRITE)) return
  await writeFile(input, `${OVERWRITE}const module = {exports: {}};export default module;${code}`)
}

export async function loadRsModule(input?: string | null, overwrite = true) {
  let appModule: any
  if (input) {
    if (overwrite) await rsModuleRewrite(input)
    const m = await (await import(`${input}?a=${new Date().getTime()}`)).default.exports
    appModule = await m.default({})
  } else {
    @Module({})
    class AppModule {}
    appModule = AppModule
  }
  return appModule
}
