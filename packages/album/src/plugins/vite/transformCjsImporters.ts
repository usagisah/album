import { cjsImporterToEsm } from "@albumjs/tools/node"
import { InlineConfig, Plugin, UserConfig, mergeConfig } from "vite"
import { SSRComposeDependency } from "../../ssrCompose/ssrCompose.start.type.js"

const applyFilesReg = /\.(js|ts|jsx|tsx)$/
export const transformCjsImportersPlugin = (cjsExternal: string[]) => {
  return {
    name: "album:ssr-compose-cjs",
    enforce: "post",
    transform(code, id) {
      if (applyFilesReg.test(id)) return cjsImporterToEsm(code, cjsExternal)
    }
  } as Plugin
}

export function withTransformCjsImporters(config: UserConfig, ssrComposeDependencies: Map<string, SSRComposeDependency>) {
  const external: string[] = []
  const cjsExternal: string[] = []
  ssrComposeDependencies.forEach((value, id) => {
    external.push(id)
    if (value.cjs) cjsExternal.push(id)
  })
  const cjsConfig: InlineConfig = {
    build: {
      rollupOptions: {
        external
      }
    },
    plugins: cjsExternal.length > 0 ? [transformCjsImportersPlugin(cjsExternal)] : undefined
  }
  return mergeConfig(config, cjsConfig)
}
