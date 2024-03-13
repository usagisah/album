import { GuardOnEnter, FC, RouterRoute, lazyLoad, GuardRoute } from "album"
import { Routes, Route, Navigate } from "react-router-dom"
"$str_imports$"
type Props = {
  onEnter?: GuardOnEnter
}

"$str_defines$"

export const routes = "$str_useRoutes$"
export const routesMap = new Map<string, RouterRoute>()

const nextRoute = (parent: any, routes: any[], props: any) => {
  return routes.map((item: any) => {
    item.parent = parent
    routesMap.set(item.fullPath, item)
    return (
      <Route key={item.path} path={item.path} element={item.component(props, item)}>
        {nextRoute(item, item.children, props)}
      </Route>
    )
  })
}

export const AppRoutes: FC<Props> = props => {// @ts-ignore
  return <Routes>{nextRoute(null, routes, props)}</Routes>
}
