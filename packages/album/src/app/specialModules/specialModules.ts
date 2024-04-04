import { isBlank } from "@albumjs/tools/node"
import { AlbumContext } from "../../context/context.dev.type.js"
import { AppSpecialModule } from "../app.dev.type.js"
import { walkModules } from "./default.js"
import { walkFlatModules } from "./flat.js"

const MODULE_STRATEGY = {
  default: walkModules,
  flat: walkFlatModules
}

export function buildSpecialModules(context: AlbumContext): Promise<AppSpecialModule[][]> {
  const { ssrCompose, appManager, logger } = context
  const { modules } = appManager
  return Promise.all(
    modules.map(module => {
      if (isBlank(module.modulePath)) {
        throw "make-special-module 发现约定式模块入口为空"
      }
      const walk = MODULE_STRATEGY[module.iteration]
      if (!walk) {
        throw "make-special-module 发现不受支持的列带类型"
      }
      return walk({ logger, parentModule: null, ...module })
    })
  )
  // if (ssrCompose) {
  //   const res = await resolveModules({ logger, parentModule: null, ...module })
  //   return res ? [res] : []
  // }
}
