import { parse, traverse } from "@babel/core"
import MS from "magic-string"
import { InlineConfig, UserConfig, mergeConfig } from "vite"
import { SSRComposeDependencies } from "../../ssrCompose/ssrCompose.type.js"
import { makeLegalIdentifier } from "../../utils/modules/makeLegalIdentifier.js"

const applyFilesReg = /\.(js|ts|jsx|tsx)$/
export function withTransformCjsPlugin(config: UserConfig, ssrComposeDependencies: SSRComposeDependencies) {
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
                if (applyFilesReg.test(id)) return transformSSRComposeImporters(code, cjsExternal)
              }
            }
          ]
        : undefined
  }
  return mergeConfig(config, cjsConfig)
}

function createMakeLegalName() {
  const counter = { true: 0, false: 0 }
  return function (name: string, isExport: boolean) {
    const { prefix, index } = isExport ? { prefix: "Export", index: counter.true++ } : { prefix: "Import", index: counter.false++ }
    return `_album_cjs${prefix}${index}_${makeLegalIdentifier(name)}`
  }
}

function transformSSRComposeImporters(code: string, cjsModules: string[]) {
  const str = new MS(code)
  const makeLegalName = createMakeLegalName()
  traverse(parse(code, { plugins: ["@babel/plugin-syntax-jsx", ["@babel/plugin-syntax-typescript", { isTSX: true }]] })!, {
    ExportAllDeclaration({ node }) {
      const importedName = node.source.value
      if (!cjsModules.includes(importedName)) return
      throw `不支持 export * from "${importedName}" 这种导出方式，请改用命名导出`
    },
    ExportNamedDeclaration({ node }) {
      if (!node.source) return

      const importedName = node.source.value
      if (!cjsModules.includes(importedName) || node.specifiers.length === 0) return

      const cjsModuleName = makeLegalName(importedName, false)
      const importNames: { importedName: string; localName: string }[] = []
      const exportNames: {}[] = []

      let defaultExports = ""
      for (const spec of node.specifiers) {
        if (spec.exported.type !== "Identifier") continue
        const exportedName = spec.exported.name

        // export * as x from ""
        if (spec.type === "ExportNamespaceSpecifier") {
          throw `不支持 export * as ${exportedName} from "${importedName}" 这种导出方式，请改用命名导出`
        }

        // export {x as default} from ""
        if (exportedName === "default") {
          defaultExports = makeLegalName("default", true)
          importNames.push({
            importedName,
            localName: defaultExports
          })
        }

        // export {x} from ""
        else {
          const localName = makeLegalName(exportedName, true)
          importNames.push({ importedName, localName })
          exportNames.push(`${localName} as ${exportedName}`)
        }
      }

      const lines = [`import ${cjsModuleName} from "${importedName}"`]

      importNames.forEach(({ importedName, localName }) => {
        if (importedName === "*") {
          lines.push(`const ${localName} = ${cjsModuleName}`)
        } else if (importedName === "default") {
          lines.push(`const ${localName} = ${cjsModuleName}.__esModule ? ${cjsModuleName}.default : ${cjsModuleName}`)
        } else {
          lines.push(`const ${localName} = ${cjsModuleName}["${importedName}"]`)
        }
      })
      if (defaultExports) {
        lines.push(`export default ${defaultExports}`)
      }
      if (exportNames.length) {
        lines.push(`export { ${exportNames.join(", ")} }`)
      }

      const { start, end } = node
      str.overwrite(start!, end!, lines.join("; ") + ";\n")
    },
    ImportDeclaration({ node }) {
      const importedName = node.source.value
      if (!cjsModules.includes(importedName)) return

      const s = node.start!
      const e = node.end!
      if (!node.specifiers.length) {
        str.overwrite(s, e, `import "/${importedName}"`)
        return
      }

      const importNames: { importedName: string; localName: string }[] = []
      for (const spec of node.specifiers) {
        // import {} from ""
        if (spec.type === "ImportSpecifier" && spec.imported.type === "Identifier") {
          const importedName = spec.imported.name
          const localName = spec.local.name
          importNames.push({ importedName, localName })
        }
        // import d from "" / import d,{} from ""
        else if (spec.type === "ImportDefaultSpecifier") {
          importNames.push({
            importedName: "default",
            localName: spec.local.name
          })
        }
        // import * as d from ""
        else if (spec.type === "ImportNamespaceSpecifier") {
          importNames.push({
            importedName: "*",
            localName: spec.local.name
          })
        } else {
          throw "存在未处理的 case，请联系作者解决 bug"
        }
      }

      const cjsModuleName = makeLegalName(importedName, false)
      const lines = [`import ${cjsModuleName} from "${importedName}"`]
      importNames.forEach(({ importedName, localName }) => {
        if (importedName === "*") {
          lines.push(`const ${localName} = ${cjsModuleName}`)
        } else if (importedName === "default") {
          lines.push(`const ${localName} = ${cjsModuleName}.__esModule ? ${cjsModuleName}.default : ${cjsModuleName}`)
        } else {
          lines.push(`const ${localName} = ${cjsModuleName}["${importedName}"]`)
        }
      })
      str.overwrite(s, e, lines.join("; ") + ";\n")
    },
    CallExpression({ node }) {
      if (node.callee.type !== "Import" || node.arguments[0].type !== "StringLiteral") return

      const importedName = node.arguments[0].value
      if (!cjsModules.includes(importedName)) return
      str.appendLeft(node.end!, ".then(m => m.default && m.default.__esModule ? m.default : ({ ...m.default, default: m.default }))")
    }
  })
  return str.toString()
}
