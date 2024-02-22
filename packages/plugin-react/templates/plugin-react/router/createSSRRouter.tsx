import React from "react"
import { StaticRouter } from "react-router-dom/server"
import { AppRoutes } from "./routes"

export function createSSRRouter(location: string) {
  const AppRouterComponent: any = ({ Layout = React.Fragment, ...props }) => (
    <StaticRouter location={location} basename="'$basename$'">
      <Layout>
        <AppRoutes {...props} />
      </Layout>
    </StaticRouter>
  )
  return AppRouterComponent
}
