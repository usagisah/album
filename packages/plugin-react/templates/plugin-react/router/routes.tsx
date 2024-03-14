import { FC, GuardOnEnter, RouterRoute } from "album"
import { RouteObject, useRoutes } from "react-router-dom"
let __var__str_imports

type Props = {
  onEnter?: GuardOnEnter
}

let __var__str_defines

export const routes = "__ref__str_useRoutes"
export const routesMap = new Map<string, RouterRoute>()

function nextRoute(parent: any, routes: any[], props: any): RouteObject[] {
  return routes.map((item: any) => {
    item.parent = parent
    routesMap.set(item.fullPath, item)
    return {
      key: item.path,
      path: item.path,
      element: item.component(props, item),
      children: nextRoute(item, item.children, props)
    }
  })
}

export const AppRoutes: FC<Props> = props => {
  return useRoutes(nextRoute(null, routes, props) as any)
}
