import "@albumjs/album/types/album"
import { Context, FunctionComponent, PropsWithChildren, ReactNode } from "react"
import { Location, NavigateFunction } from "react-router-dom"

declare module "album" {
  /* -------------- utils -------------- */
  export type FC<P = {}> = FunctionComponent<PropsWithChildren<P>>
  /* -------------- utils-end -------------- */

  /* -------------- router -------------- */
  export type GuardOnEnter = (local: RouterLocation, navigate: NavigateFunction) => any
  export type GuardLoader = (local: RouterLocation) => any
  export type GuardRouteProps = {
    children?: any
    onEnter?: GuardOnEnter
    route: RouterRoute
  }
  export interface RouterLocation extends Location {
    route: RouterRoute
  }
  export type AppRouterFunComponent = FC<{ Layout: FC<any>; onEnter?: GuardOnEnter }>

  export function GuardRoute(props: GuardRouteProps): ReactNode
  export function lazyLoad(factory: () => Promise<{ default: any }>, fallback?: ReactNode): ReactNode
  /* -------------- router-end -------------- */

  /* -------------- ssr-compose -------------- */
  export type RemoteAppLoaderProps = {
    sourcePath: string
    wrapperName?: string
    wrapperProps?: Record<string, any>
    [propKey: string]: any
  }

  export type ComponentRemoteAppLoader = FC<RemoteAppLoaderProps>
  export function createRemoteAppLoader(props: { remote: boolean; url: string }): ComponentRemoteAppLoader
  /* -------------- ssr-compose-end -------------- */

  /* -------------- hooks -------------- */
  export function useRoutes(): RouterRoute[]

  export function useRoutesMap(): Map<string, RouterRoute>

  export function useRouter(): RouterLocation

  export function useLoader(): ["success", any] | ["loading", null] | ["fail", any]
  /* -------------- hooks-end -------------- */
}

import { AppRouterFunComponent } from "album"
declare module "album.server" {
  /* -------------- hooks -------------- */
  export function useServer(fn: (context: SSRProps) => any): Promise<void>
  export function useServer<T>(id: string, fn: (ctx: SSRProps) => T | Promise<T>): T

  export function useServerRouteData(): Record<string, any>
  /* -------------- hooks-end -------------- */

  /* -------------- type -------------- */
  export type MainSSRApp = string | { data?: Record<string, any>; App?: ReactNode; Head?: ReactNode }
  export type MainSSRFactory = (AppRouter: AppRouterFunComponent, props: SSRProps) => MainSSRApp
  /* -------------- type-end -------------- */
}

declare module "album.dependency" {
  export const RouteContext: Context<any>
  export const SSRContext: Context<{ context: any; getSSRProps: () => any }>
  export type RouteLoaderStage = "loading" | "success" | "fail"
  export type RouteLoaderValue = {
    id: string
    value: any
    pending: ((stage: RouteLoaderStage, value: any) => any)[]
    stage: RouteLoaderStage
  }
  export type RouteContextValue = {
    loader: Map<string, RouteLoaderValue>
    routerLocation: any
    parentContext?: RouteContextValue | null
  }
  export const createRemoteAppLoader: any
}
