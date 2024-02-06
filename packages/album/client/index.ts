function createEmptyHook<T>(name: string) {
  return (() => {
    throw new Error(`the album-hooks ${name} hasn't been registered`)
  }) as T
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

export let useServer = createEmptyHook<(fn: (context: SSRProps) => any) => Promise<void>>("useServer")

export let useServerData: <T>(id: string, fn: (ctx: SSRProps) => T | Promise<T>) => T = createEmptyHook<any>("useServerData")

export let useServerRouteData = createEmptyHook<() => any>("useServerRouteData")

export interface CreateRemoteAppLoader {}
export let createRemoteAppLoader: CreateRemoteAppLoader = (props: any) => {
  const g: any = globalThis
  if (g?.window?.__$_album_ssr_compose) return g.window.__$_album_ssr_compose.createRemoteAppLoader(props)
  throw new Error(`the createRemoteAppLoader hasn't been registered`)
}

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
    case "createRemoteAppLoader":
      createRemoteAppLoader = value
      return true
  }
  return false
}

export function registryHookIfAbsent(name: string, value: any) {
  switch (name) {
    case "useRoutes":
      if (!useRoutes) useRoutes = value
      return true
    case "useRoutesMap":
      if (!useRoutesMap) useRoutesMap = value
      return true
    case "useRouter":
      if (!useRouter) useRouter = value
      return true
    case "useLoader":
      if (!useLoader) useLoader = value
      return true
    case "useServer":
      if (!useServer) useServer = value
      return true
    case "useServerData":
      if (!useServerData) useServerData = value
      return true
    case "useServerRouteData":
      if (!useServerRouteData) useServerRouteData = value
      return true
    case "createRemoteAppLoader":
      if (!createRemoteAppLoader) createRemoteAppLoader = value
      return true
  }
  return false
}
