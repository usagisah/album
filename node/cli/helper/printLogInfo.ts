import { AlbumContext } from "../../context/AlbumContext.js"
import { PluginOnLogParam } from "../../context/AlbumContext.type.js"
import { callPluginWithCatch, isString } from "../../utils/utils.js"

type BuildLogInfo = {
  type: any
  context: AlbumContext
  messages: [...(Record<string, any> | string)[], string][]
}

export async function printLogInfo({ type, context, messages }: BuildLogInfo) {
  const { logger, plugins } = context
  const { messages: msgs } = await callPluginWithCatch<PluginOnLogParam>(
    plugins.hooks.onStageLog,
    {
      type,
      albumContext: context,
      messages
    },
    e => logger.error("PluginOnLog-" + type, e, "album")
  )
  for (const msg of msgs) {
    const _msg = msg
      .slice(0, -1)
      .map(m => (isString(m) ? m : JSON.stringify(m, null, 2)))
      .join(" ")
    const _ctx = msg.at(-1)
    logger.log(_msg, _ctx)
  }
}
