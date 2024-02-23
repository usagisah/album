import { AlbumSSRRenderOptions } from "@albumjs/album/server"
import { isPlainObject } from "@albumjs/album/tools"
import { SSRContext } from "album.dependency"
import { renderToPipeableStream } from "react-dom/server"
import { createSSRRouter } from "../router/createSSRRouter"
import { SSRComposeContext } from "../ssr-compose/SSRComposeContext"
import { SSRServerShared } from "./SSRServerShared"
import { resolveActionRouteData } from "./resolveActionRouteData"
// @ts-expect-error
import userSSREntry from "'$mainServerPath$'"
import { Writable } from "stream"

export async function ssrRender(renderOptions: AlbumSSRRenderOptions) {
  const { ssrContext, getSSRProps, ssrComposeContext } = renderOptions
  const { logger, ssrCompose, req, res, serverRouteData, serverDynamicData } = ssrContext
  const { sendMode } = ssrContext.ssrRender
  const { sources } = ssrComposeContext ?? {}
  const { PreRender, mainEntryPath, browserScript } = await SSRServerShared.resolveContext(renderOptions)

  const actionData = await resolveActionRouteData(ssrContext, getSSRProps)
  const { App = null, Head = null, data } = await (userSSREntry as any)(createSSRRouter(req.albumOptions?.originalUrl ?? req.url), getSSRProps())
  Object.assign(serverRouteData, actionData, isPlainObject(data) ? data : {})

  let app = (
    <SSRContext.Provider value={{ context: ssrContext, getSSRProps }}>
      <html lang="en">
        <head>
          <PreRender />
          {Head}
        </head>
        <body>{App}</body>
      </html>
    </SSRContext.Provider>
  )
  if (ssrCompose) {
    app = <SSRComposeContext.Provider value={ssrComposeContext!}>{app}</SSRComposeContext.Provider>
  }

  const { pipe } = renderToPipeableStream(app, {
    onShellReady() {
      res.header("content-type", "text/html")
      if (sendMode === "pipe") pipe(res)
    },
    onAllReady() {
      let clientJsonData = ""
      for (const id of Object.getOwnPropertyNames(serverDynamicData)) {
        const value = serverDynamicData[id]
        try {
          clientJsonData += `<script type="text/json" id="server-data-${id}">${JSON.stringify(value)}</script>`
        } catch {
          logger.error("server-data 必须能够被 JSON.stringify 序列化", "失败信息", { id: value }, "ssrRender")
        }
      }
      if (Object.keys(serverRouteData).length > 0) {
        try {
          clientJsonData += `<script type="text/json" id="server-router-data">${JSON.stringify(serverRouteData)}</script>`
        } catch {
          logger.error("server-router-data 必须能够被 JSON.stringify 序列化", "失败信息", serverRouteData, "ssrRender")
        }
      }

      if (ssrCompose) {
        const code = sendMode === "string" ? readPipeStreamCode(pipe) : ""
        let cssCode = ""
        let jsCode = ""
        for (const sourcePath of Object.getOwnPropertyNames(sources)) {
          const source = sources![sourcePath]
          if (source === false) continue
          source.css.forEach(css => (cssCode += `{type:2,paths:["${css}"]},`))

          let importers = ""
          source.importPaths.forEach(p => (importers += `"${p}",`))
          jsCode += `{sid:"${sourcePath}",type:1,paths:[${importers}]},`
        }
        const clientScript = [
          `<script type="module">`,
          `await import("${browserScript}");`,
          `const {loadModules}=window.__$_album_ssr_compose;const m=await loadModules([${cssCode + jsCode}]);`,
          `import("${mainEntryPath}");`,
          "</script>"
        ]
        return res.write(code + clientJsonData + clientScript.join(""))
      }

      if (sendMode === "string") {
        const code = readPipeStreamCode(pipe)
        const flag = "</head>"
        const index = code.indexOf(flag)
        if (index > -1) {
          res.send(code.replace(flag, flag + clientJsonData))
        } else {
          res.send(clientJsonData + code)
        }
        return
      }
      if (sendMode === "pipe" && !ssrCompose) {
        return res.send(clientJsonData + `<script type="module" src="${mainEntryPath}"><\/script>`)
      }
      return res.status(500).send("")
    }
  })
}

function readPipeStreamCode(pipe: (destination: Writable) => Writable) {
  let code = ""
  pipe(
    new Writable({
      write(c, _, cb) {
        code += c.toString()
        cb()
      }
    })
  )
  return code
}
