import { InlineConfig, UserConfig, mergeConfig } from "vite"
import { SSRComposeDependency } from "../../ssrCompose/ssrCompose.start.type.js"
import { cjsImporterToEsm } from "../../utils/modules/cjs/transformImporters.js"

const applyFilesReg = /\.(js|ts|jsx|tsx)$/
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
    plugins:
      cjsExternal.length > 0
        ? [
            {
              name: "album:ssr-compose-cjs",
              enforce: "post",
              transform(code, id) {
                if (applyFilesReg.test(id)) return cjsImporterToEsm(code, cjsExternal)
              }
            }
          ]
        : undefined
  }
  return mergeConfig(config, cjsConfig)
}
