import { readJson, writeJson } from "@albumjs/tools/lib/fs-extra"
import q from "@albumjs/tools/lib/inquirer"
import { green, yellow } from "colorette"
import { execaCommand } from "execa"
import minimist from "minimist"
import { resolve } from "path"

console.clear()
const cwd = process.cwd()
const args = minimist(process.argv.slice(2))
const pubVersion = args._[0]
const { p } = args
const { pubPkg } = await q.prompt([
  {
    type: "checkbox",
    name: "pubPkg",
    message: "选择发布的包",
    choices: ["tools", "album", "cli", "plugin-react"]
  }
])

if (pubPkg.length === 0 || !pubVersion) {
  throw "发布信息异常"
}

const pkgJson = {
  album: {
    path: resolve(cwd, "packages/album/package.json"),
    json: null
  },
  cli: {
    path: resolve(cwd, "packages/cli/package.json"),
    json: null
  },
  "plugin-react": {
    path: resolve(cwd, "packages/plugin-react/package.json"),
    json: null
  },
  tools: {
    path: resolve(cwd, "packages/tools/package.json"),
    json: null
  }
}

pubPkg.reduce((job, pkg) => job.then(() => publish(pkg)), Promise.resolve())

async function publish(pkg) {
  debugger
  const info = pkgJson[pkg]
  const restore = await overwritePkgJson(info)
  console.log(yellow(`/* -------------- publish:${pkg} -------------- */`))
  const { check } = await q.prompt([
    {
      type: "confirm",
      name: "check",
      message: `检查提交信息是否正确: ${JSON.stringify({ pkg, path: info.path, version: pubVersion })}`,
      default: false
    }
  ])
  if (!check) {
    throw `pub (${pkg}) fail`
  }
  await execaCommand(`cd ${resolve(info.path, "../")} ${p ? `&& ${p}` : ""} && npm publish --access public`, { shell: true })
  await restore()
  console.log(green(`pub success`))
}

async function overwritePkgJson(info) {
  const originJson = await readJson(info.path)
  const _json = JSON.parse(JSON.stringify(originJson))
  const { dependencies, devDependencies } = _json

  const resolveVersion = async (key, val) => {debugger
    if (key.startsWith("@albumjs/") && val === "workspace:^") {
      const refName = key.split("/")[1]
      let refJson = pkgJson[refName].json
      if (!refJson) {
        refJson = await readJson(pkgJson[refName].path)
      }
      return "^" + refJson.version
    }
    return val
  }
  for (const key in dependencies ?? {}) {
    _json.dependencies[key] = resolveVersion(key, dependencies[key])
  }
  for (const key in devDependencies ?? {}) {
    _json.devDependencies[key] = resolveVersion(key, devDependencies[key])
  }

  _json.version = originJson.version = pubVersion
  if (!info.json) {
    info.json = originJson
  }
  await writeJson(info.path, _json)
  return async () => writeJson(info.path, originJson)
}
