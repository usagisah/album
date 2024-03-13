import { FC, GuardOnEnter, RouterRoute } from "album"
import { Route, Routes } from "react-router-dom"
let __var__str_imports

type Props = {
  onEnter?: GuardOnEnter
}

let __var__str_defines

export const routes = "__ref__str_useRoutes"
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

export const AppRoutes: FC<Props> = props => {
  return <Routes>{nextRoute(null, routes, props)}</Routes>
}
