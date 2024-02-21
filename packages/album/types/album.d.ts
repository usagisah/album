declare const __app_id__: string
declare const __app_id_path__: string
declare const __ssr_compose__: boolean

interface _RouterLocation {
  params: Record<string, string>
  query: Record<string, any>
  pathname: string
  meta: any
  [key: string]: any
}

interface _RouterRoute {
  name: string
  path: string
  fullPath: string
  component: (...props: any) => any
  meta: any
  parent: RouterRoute | null
  children: RouterRoute[]
  [key: string]: any
}

declare module "album" {
  export interface RouterLocation extends _RouterLocation {}

  export interface RouterRoute extends _RouterRoute {}
}

declare module "album/server" {
  export interface SSRProps {
    mode: string
    serverMode: string
    ssr: boolean
    ssrCompose: boolean
    env: Record<string, string>
    inputs: Record<string, string>
    logger: Record<string, (...message: string[]) => any>
    query: Record<string, any>
    params: Record<string, string>
    req: Request
    headers: Record<string, string>
    albumOptions: {
      pathname: string
      prefix: string
    }
    serverRouteData: Record<string, any>
    serverDynamicData: Record<string, any>
    [key: string]: any
  }
}
