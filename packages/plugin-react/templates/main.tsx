import { AppRouterFunComponent } from "album"
import { Fragment } from "react"
import { BrowserRouter } from "react-router-dom"
import { AppRoutes } from "./plugin-react/router/routes"
// @ts-expect-error
import mainFactory from "'$mainPath$'"

const AppRouterComponent: AppRouterFunComponent = ({ Layout = Fragment, ...props }) => (
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
