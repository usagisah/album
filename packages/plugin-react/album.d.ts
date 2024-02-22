import "@albumjs/album/types/album"
import { PropsWithChildren, ReactNode, ValidationMap, WeakValidationMap } from "react"
import { Location, NavigateFunction } from "react-router-dom"

declare module "album" {
  /* -------------- utils -------------- */
  export type FC<P = {}> = {
    (props: PropsWithChildren<P>, context?: any): ReactNode | null
    propTypes?: WeakValidationMap<P> | undefined
    contextTypes?: ValidationMap<any> | undefined
    defaultProps?: Partial<P> | undefined
    displayName?: string | undefined
  }
  /* -------------- utils-end -------------- */

  /* -------------- router -------------- */
  export type GuardOnEnter = (params: LocalData, navigate: NavigateFunction) => any
  export type GuardLoader = (local: LocalData) => any
  export type GuardRouteProps = {
    children?: any
    onEnter?: GuardOnEnter
    route: RouterRoute
  }
  export type LocalData = Location & {
    params: Record<string, any>
    query: Record<string, any>
    route: RouterRoute
    [key: string]: any
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

declare module "album.server" {
  /* -------------- hooks -------------- */
  export function useServer(fn: (context: SSRProps) => any): Promise<void>
  export function useServer<T>(id: string, fn: (ctx: SSRProps) => T | Promise<T>): T

  export function useServerRouteData(): Record<string, any>
  /* -------------- hooks-end -------------- */
}
