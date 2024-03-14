import { queryString } from "@albumjs/album/tools"
import { GuardRouteProps, RouterLocation, RouterRoute, useRoutesMap } from "album"
import { RouteContext, RouteContextValue, RouteLoaderValue } from "album.dependency"
import React from "react"
import { matchPath, useLocation, useNavigate, useParams } from "react-router-dom"
import { callPromiseWithCatch } from "../utils/callWithCatch"

export function GuardRoute(props: GuardRouteProps) {
  const { route, children, onEnter } = props

  const location = useLocation()
  const navigate = useNavigate()

  const routerLocation = React.useRef<RouterLocation>({} as any).current
  const parentContext = React.useContext(RouteContext)
  const context = React.useRef<RouteContextValue>({ routerLocation, parentContext, loader: parentContext?.loader }).current

  const needGuard = !parentContext && onEnter
  const [Component, setComponent] = React.useState(needGuard ? null : children)

  if (parentContext) {
    Object.assign(routerLocation, parentContext)
    routerLocation.route = route
  } else {
    Object.assign(routerLocation, {
      ...location,
      params: useParams(),
      query: queryString.parse(location.search),
      route
    })
    context.loader = new Map()
  }

  let unMounted = false
  React.useEffect(() => {
    doEach()
    return () => {
      unMounted = true
    }
  }, [location.pathname])

  if (import.meta.env.SSR) {
    doEach()
  }

  async function doEach() {
    if (needGuard) {
      const { pathname } = routerLocation
      const res = await callPromiseWithCatch(props.onEnter, [routerLocation, navigate], "GuardRoute-onEnter has a error")
      if (res !== true || pathname !== location.pathname) {
        return
      }
      doLoader()
      setComponent(children)
      return
    }

    if (!needGuard && Component !== children) {
      doLoader()
      setComponent(children)
      return
    }

    doLoader()
  }

  async function doLoader() {
    if (parentContext) return

    const curPath = routerLocation.pathname
    const routesList = [...useRoutesMap()].find(item => matchPath(item[0], curPath))!

    eachRouteLoader(routesList[1], async route => {
      if (unMounted) {
        return
      }

      const { fullPath, meta } = route
      const record = context.loader.get(fullPath)!
      if (record?.stage === "loading") {
        return
      }

      const loaderRecord: RouteLoaderValue = { stage: "loading", value: null, pending: [] }
      context.loader.set(fullPath, loaderRecord)
      try {
        loaderRecord.value = await meta.loader({ ...routerLocation })
        loaderRecord.stage = "success"
      } catch (e) {
        loaderRecord.value = e
        loaderRecord.stage = "fail"
      }

      if (!unMounted) {
        for (const set of loaderRecord.pending) {
          set(loaderRecord.stage, loaderRecord.value)
        }
      }
      loaderRecord.pending.length = 0
    })
  }

  return <RouteContext.Provider value={context}>{Component}</RouteContext.Provider>
}

function eachRouteLoader(route: RouterRoute, fn: (route: RouterRoute) => any) {
  const { parent, meta } = route
  if (parent) {
    eachRouteLoader(parent, fn)
  }
  if (meta?.loader) {
    fn(route)
  }
}
