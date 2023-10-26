import type { AlbumContext } from "../../context/AlbumContext.type.js"
import { PromiseAll, isFunction } from "../../utils/utils.js"

export async function callSSRServerInit(context: AlbumContext) {
  const { serverMode, configs, inputs, vite, logger } = context
  const { ssrCompose } = configs
  const { realSSRInput, ssrComposeProjectsInput } = inputs
  try {
    if (serverMode !== "start") {
      const { onServerInit } = await vite.viteDevServer.ssrLoadModule(realSSRInput)
      if (isFunction(onServerInit)) onServerInit(context)
      return
    }
  
    if (!ssrCompose) {
      const { onServerInit } = await import(realSSRInput)
      if (isFunction(onServerInit)) onServerInit(context)
      return
    }
  
    const fns: any[] = []
    ssrComposeProjectsInput.forEach(async ({ mainServerInput }) => {
      const { onServerInit } = await import(mainServerInput)
      if (isFunction(onServerInit)) fns.push(onServerInit)
    })
    await PromiseAll(fns)
  }
  catch(e) {
    logger.error("onServerInit 存在错误，程序被迫中断", e, "album")
  }
}
