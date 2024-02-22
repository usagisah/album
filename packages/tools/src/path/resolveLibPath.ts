import { existsSync } from "fs"
import { readFile } from "fs/promises"
import { resolve } from "path"
import { Package, exports } from "resolve.exports"
import { resolveRealPath } from "./resolveRealPath.js"

const NODE_MODULES = "node_modules"

export async function resolveLibPath(libPath: string) {
  let index = libPath.lastIndexOf(NODE_MODULES)
  if (index === -1) throw "resolveLibPath 的参数必须是一个指向 node_modules 内的依赖路径"
  index = index + NODE_MODULES.length

  const node_modules = libPath.slice(0, index)
  const ref_name = libPath.slice(index + 1)
  if (ref_name.length === 0) throw "包名不合法"

  let _scope = ""
  let _name = ref_name
  let _subpath = ""
  if (ref_name.startsWith("@")) {
    const i = ref_name.indexOf("/")
    _scope = ref_name.slice(0, i)
    _name = ref_name.slice(i + 1)
  }
  const subIndex = _name.indexOf("/")
  if (subIndex > -1) {
    _subpath = _name.slice(subIndex + 1)
    _name = _name.slice(0, subIndex)
  }

  const _realModulePath = await resolveRealPath(resolve(node_modules, _scope, _name))
  const modulePath = resolve(node_modules, _realModulePath)
  const pkgPath = resolve(modulePath, "package.json")
  if (!existsSync(pkgPath)) throw "无法识别非法依赖: " + pkgPath
  const pkg: Package = JSON.parse(await readFile(pkgPath, "utf-8"))

  let subpath: string | undefined
  try {
    const res = exports(pkg, _subpath)
    if (res) subpath = res[0]
  } catch {}
  if (!subpath) subpath = pkg.module ?? pkg.main
  if (subpath) {
    if (subpath.startsWith("/")) subpath = subpath.slice(1)
    return {
      /**
       * 在应用中引入的名称路径
       */
      refPath: [_scope, _name, _subpath].filter(Boolean).join("/"),
      /**
       * 名称路径指向的真实入口文件路径
       */
      refFullPath: resolve(modulePath, subpath),
      /**
       * node_modules 路径
       */
      node_modules,
      scope: _scope,
      name: _name,
      subpath: _subpath
    }
  }
  return null
}
