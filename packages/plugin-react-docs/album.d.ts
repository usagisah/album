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
    onEnter?: GuardOnEnter
    route: RouterRoute
    children?: any
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
import { Request, Response } from "express"
declare module "album.server" {
  /* -------------- hooks -------------- */
  export function useServer(fn: (context: SSRProps) => any): Promise<void>
  export function useServer<T>(id: string, fn: (ctx: SSRProps) => T | Promise<T>): T

  export function useServerRouteData(): Record<string, any>
  /* -------------- hooks-end -------------- */

  /* -------------- type -------------- */
  export type MainSSRAppOnError = ((e: any) => void | { code?: number; error?: any; redirect?: string }) | ((e: any) => Promise<void | { code?: number; redirect?: string }>)

  export type MainSSRAppOnAfterSend = () => { html?: string } | Promise<{ html?: string }>

  export type MainSSRAppRenderOptions = {
    req: Request
    res: Response
    resolveRouteActions: () => Promise<Record<string, string>>
    resolveServerDateScript: () => string
    resolveHead: () => ReactNode
    resolveProvide: (children?: ReactNode) => ReactNode
  }
  export type MainSSRAppRender = (options: MainSSRAppRenderOptions) => any

  export type MainSSRAppOptions = {
    redirect?: string
    data?: Record<string, any>
    App?: ReactNode
    Head?: ReactNode
    onAfterSend?: MainSSRAppOnAfterSend
    render?: MainSSRAppRender
    onError?: MainSSRAppOnError
  }
  export type MainSSRFactory = (AppRouter: AppRouterFunComponent, props: SSRProps) => MainSSRAppOptions
  /* -------------- type-end -------------- */
}

declare module "album.dependency" {
  export const RouteContext: Context<any>
  export const SSRContext: Context<{ context: any; getSSRProps: () => any }>
  export type RouteLoaderStage = "loading" | "success" | "fail"
  export type RouteLoaderValue = {
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
