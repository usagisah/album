import { registryHook } from "albumjs"
import { Fragment } from "react"
import { StaticRouter } from "react-router-dom/server"
import { useLoader } from "../hooks/useLoader"
import { useRouter } from "../hooks/useRouter"
import { useServer } from "../hooks/useServer"
import { useServerRouteData } from "../hooks/useServerRouteData"
import { AppRoutes, routes, routesMap } from "./routes"

registryHook("useRoutes", () => routes)
registryHook("useRoutesMap", () => routesMap)
registryHook("useRouter", useRouter)
registryHook("useLoader", useLoader)
registryHook("useServer", useServer)
registryHook("useServerRouteData", useServerRouteData)
"$RemoteAppLoader$"

export function createSSRRouter(location: string) {
  const AppRouterComponent: any = ({ Layout = Fragment, ...props }) => (
    <StaticRouter location={location} basename="'$basename$'">
      <Layout>
        <AppRoutes {...props} />
      </Layout>
    </StaticRouter>
  )
  return AppRouterComponent
}
