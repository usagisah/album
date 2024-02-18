import { AppRouterFC, registryHook } from "albumjs"
import { Fragment } from "react"
import { BrowserRouter } from "react-router-dom"
import { AppRoutes, routes, routesMap } from "./plugin-react/router/routes"

import { useLoader } from "./plugin-react/hooks/useLoader"
import { useRouter } from "./plugin-react/hooks/useRouter"
registryHook("useRoutes", () => routes)
registryHook("useRoutesMap", () => routesMap)
registryHook("useRouter", useRouter)
registryHook("useLoader", useLoader)

"$ssr_hooks_registry$"

"$RemoteAppLoader$"
// @ts-expect-error
import mainFactory from "'$mainPath$'"

const AppRouterComponent: AppRouterFC = ({ Layout = Fragment, ...props }) => (
  <BrowserRouter basename="'$basename$'">
    <Layout>
      <AppRoutes {...props} />
    </Layout>
  </BrowserRouter>
)

const appId = "'$appId$'"
const g: any = globalThis
const m: any = g.__$_album_ssr_compose
if (!__ssr_compose__ || !m || m.appId === appId) {
  mainFactory(AppRouterComponent)
}
