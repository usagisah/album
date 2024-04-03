import { AlbumSSRRenderOptions } from "@albumjs/album/server"
import { isPlainObject } from "@albumjs/album/tools"
import { SSRContext } from "album.dependency"
import { MainSSRAppOptions } from "album.server"
import { ReactNode } from "react"
import { renderToPipeableStream } from "react-dom/server"
import { matchPath } from "react-router-dom"
import { Writable } from "stream"
import { createSSRRouter } from "../router/createSSRRouter"
import { redirectRoutes } from "../router/routes.ssr"
import { SSRComposeContext } from "../ssr-compose/SSRComposeContext"
import { SSRServerShared } from "./SSRServerShared"
import { resolveActionRouteData } from "./resolveActionRouteData"
let __var__mainSSR

export async function ssrRender(renderOptions: AlbumSSRRenderOptions) {
  const { ssrContext, getSSRProps, ssrComposeContext } = renderOptions
  const { logger, ssrCompose, req, res, serverRouteData, serverDynamicData } = ssrContext
  const { sendMode } = ssrContext.ssrRender
  const { sources } = ssrComposeContext ?? {}
  const { PreRender, mainEntryPath, browserScript } = await SSRServerShared.resolveContext(renderOptions)

  Object.assign(serverRouteData, await resolveRouteActions())
  const requestUrlOptions = req.albumOptions ?? { originalUrl: req.url, pathname: req.path }
  const { App, Head, data, redirect, onAfterSend, onError, render } = normalizeFactoryResult(
    requestUrlOptions.pathname,
    await (mainSSR as any)(createSSRRouter(requestUrlOptions.originalUrl), getSSRProps())
  )
  if (isPlainObject(data)) {
    Object.assign(serverRouteData, data)
  }

  if (render) {
    return render({
      req,
      res,
      resolveRouteActions,
      resolveServerDateScript,
      resolveHead,
      resolveProvide
    })
  }

  if (redirect) {
    const url = new URL("http://usagisah.cc" + redirect)
    for (const key in req.query) {
      url.searchParams.append(key, (req.query as any)[key])
    }
    return res.redirect(302, url.pathname + url.search)
  }

  async function resolveRouteActions() {
    return resolveActionRouteData(ssrContext, getSSRProps)
  }
  function resolveServerDateScript() {
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
    return clientJsonData
  }
  function resolveHead() {
    return <PreRender />
  }
  function resolveProvide(children: ReactNode) {
    let app = <SSRContext.Provider value={{ context: ssrContext, getSSRProps }}>{children}</SSRContext.Provider>
    if (ssrCompose) {
      app = <SSRComposeContext.Provider value={ssrComposeContext!}>{app}</SSRComposeContext.Provider>
    }
    return app
  }

  try {
    const complete = () => {
      setTimeout(async () => {
        const _res = await onAfterSend?.()
        if (_res?.html) {
          res.write(_res.html)
        }
        res.send()
      })
    }
    const app = resolveProvide(
      <html lang="en">
        <head>
          <PreRender />
          {Head}
        </head>
        <body>{App}</body>
      </html>
    )
    const { pipe } = renderToPipeableStream(app, {
      onShellReady() {
        res.header("content-type", "text/html")
        if (sendMode === "pipe") {
          pipe(res)
        }
      },
      onAllReady() {
        res.write(resolveServerDateScript())
        if (ssrCompose) {
          const code = sendMode === "string" ? readPipeStreamCode(pipe) : ""
          res.write(code)

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
          res.write(clientScript.join(""))
          return complete()
        }
        if (sendMode === "string") {
          res.write(readPipeStreamCode(pipe))
          return complete()
        }
        if (sendMode === "pipe") {
          res.write(`<script type="module" src="${mainEntryPath}"><\/script>`)
          return complete()
        }
        return res.status(500), complete()
      }
    })
  } catch (e) {
    if (!onError) {
      throw e
    }

    const onErrorRes = await onError(e)
    if (!onErrorRes) {
      return
    }

    const { code, redirect } = onErrorRes
    if (redirect) {
      return code ? res.redirect(code, redirect) : res.redirect(redirect)
    }
  }
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

function normalizeFactoryResult(url: string, app: MainSSRAppOptions) {
  const _app: MainSSRAppOptions = { ...app }
  if (app.render) {
    if (typeof app.render === "function") {
      return app
    } else {
      app.render = undefined
    }
  }

  if (_app.redirect) {
    if (!_app.redirect.startsWith("/")) {
      _app.redirect = "/" + app.redirect
    }
    return _app
  }

  const res = redirectRoutes.find(item => matchPath(item.from, url))
  if (res) {
    _app.redirect = res.to
    return _app
  }

  if (typeof app.onAfterSend !== "function") {
    _app.onAfterSend = undefined
  }

  if (typeof app.onError !== "function") {
    _app.onError = undefined
  }

  return _app
}
