import { CAC } from "@albumjs/tools/lib/cac"
import { gray, green, greenBright, red } from "@albumjs/tools/lib/colorette"
import q from "@albumjs/tools/lib/inquirer"
import { ParsedArgs } from "@albumjs/tools/lib/minimist"
import strip from "@albumjs/tools/lib/strip-ansi"
import { legalRegistryList, registryMapper } from "./constants.js"
import { RegistryManager } from "./manager.js"

export default function command(cli: CAC, args: ParsedArgs) {
  const manager = new RegistryManager()
  cli
    .command("registry [...targets]", "操作 'npm|yarn|pnpm|tnpm|cnpm' 注册表")
    .option("-s --source <source>", "要切换的目标源")
    .option("-l, --list", "打印已安装的包管理器信息")
    .action(async (targets: string[], { source, list }) => {
      if (list) {
        const res = await manager.list(targets)
        res.forEach(({ target, registry, version }) => {
          if (target === "cnpm") {
            version = version.match(new RegExp(`cnpm@[\\d\\.]+\\b`))[0]
          }
          console.log(gray(`${target.padEnd(4, " ")} <==> version:${version.padEnd(12, " ")} registry:${registry}`))
        })
        return
      }

      if (targets.length === 0) {
        targets = await resolveRegistryTargets()
      }
      if (targets.length === 0) {
        console.log(red("判断修改数量为0, cli 自动退出"))
        process.exit(1)
      }
      if (!source) {
        source = await resolveRegistryMapper()
      }
      await manager.setRegistry(targets, source)
      console.log("\n", green(`修改包管理器列表 [${targets.join(",")}] 全部成功，修改源-(${source})`))
    })
}

async function resolveRegistryTargets() {
  return q
    .prompt([
      {
        type: "checkbox",
        name: "type",
        message: greenBright("请选择要切换的包管理器"),
        loop: true,
        choices: legalRegistryList,
        default: ["npm", "pnpm"]
      }
    ])
    .then(r => r.type)
}

async function resolveRegistryMapper() {
  return q
    .prompt([
      {
        type: "list",
        name: "source",
        message: greenBright("请选择要切换的注册源"),
        loop: true,
        choices: Object.keys(registryMapper).map(k => `${k} ${gray(registryMapper[k])}`),
        default: ["npm"]
      }
    ])
    .then(r => strip(r.source.split(/\s+/)[1]))
}
