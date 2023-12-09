import { Module } from "@nestjs/common"
import { readFile, writeFile } from "fs/promises"
import { sep } from "path"
import { DevServerConfigAppModule } from "../context/context.type.js"

export async function loadRootModule(appModuleInfo: DevServerConfigAppModule) {
  const { input, output, filename } = appModuleInfo
  let appModule: any
  if (input) {
    const filePath = output + sep + filename
    const code = await readFile(filePath, "utf-8")
    await writeFile(filePath, `const module = {exports: {}};export default module;` + code)
    const m = await (await import(`${filePath}?a=${new Date().getTime()}`)).default.exports
    appModule = await m.default({})
  } else {
    @Module({})
    class AppModule {}
    appModule = AppModule
  }
  return appModule
}
