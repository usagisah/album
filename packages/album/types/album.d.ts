declare const __app_id__: string
declare const __app_id_path__: string
declare const __ssr_compose__: boolean

declare module "album" {
  export interface RouterLocation {
    params: Record<string, string>
    query: Record<string, any>
    pathname: string
    meta: any
  }

  export interface RouterRoute {
    name: string
    path: string
    fullPath: string
    component: (...props: any) => any
    meta: any
    parent: RouterRoute | null
    children: RouterRoute[]
    [key: string]: any
  }
}

declare module "album.server" {
  export interface SSRProps {
    query: Record<string, any>
    params: Record<string, string>
    headers: Record<string, string>
    albumOptions: {
      pathname: string
      prefix: string
      url: string
      originalPathname: string
      originalUrl: string
    }
    logger: Record<string, (...message: string[]) => any>
  }
}

declare module "album.dependency" {}
