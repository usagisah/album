function createEmptyHook<T>(name: string) {
  return (() => {
    throw new Error(`the album-hooks ${name} hasn't been registered`)
  }) as T
}
function createEmptyComponent(name: string): any {
  return function EmptyComponent() {
    throw new Error(`the album-component ${name} hasn't been registered`)
  }
}

export type RouterRoute = {
  name: string
  path: string
  fullPath: string
  component: (...props: any) => any
  meta: any
  parent: RouterRoute | null
  children: RouterRoute[]
  [key: string]: any
}
export let useRoutes = createEmptyHook<() => RouterRoute[]>("useRoutes")

export let useRoutesMap = createEmptyHook<() => Map<string, RouterRoute>>("useRoutesMap")

export type RouterLocation = {
  params: Record<string, string>
  query: Record<string, any>
  pathname: string
  meta: any
  [key: string]: any
}
export let useRouter = createEmptyHook<() => RouterLocation>("useRouter")

export let useLoader = createEmptyHook<() => ["success", any] | ["loading", null] | ["fail", any]>("useLoader")

export type SSRProps = {
  req: Request
  headers: Record<string, string>
  mode: string
  serverMode: string
  logger: Record<string, (...message: string[]) => any>
  inputs: Record<string, string>
  outputs: Record<string, string>
  meta: any
  query: Record<string, any>
  params: Record<string, any>
  [key: string]: any
}

export let useServer = createEmptyHook<(fn: (context: SSRProps) => any) => Promise<void>>("useServer")

export let useServerData: <T>(id: string, fn: (ctx: SSRProps) => T | Promise<T>) => T = createEmptyHook<any>("useServerData")

export let useServerRouteData = createEmptyHook<() => any>("useServerRouteData")

export let RemoteAppLoader = createEmptyComponent("RemoteAppLoader")

export function registryHook(name: string, value: any) {
  switch (name) {
    case "useRoutes":
      useRoutes = value
      return true
    case "useRoutesMap":
      useRoutesMap = value
      return true
    case "useRouter":
      useRouter = value
      return true
    case "useLoader":
      useLoader = value
      return true
    case "useServer":
      useServer = value
      return true
    case "useServerData":
      useServerData = value
      return true
    case "useServerRouteData":
      useServerRouteData = value
      return true
    case "RemoteAppLoader":
      RemoteAppLoader = value
      return true
  }
  return false
}
