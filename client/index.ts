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

export let useRoutesMap =
  createEmptyHook<() => Map<string, RouterRoute>>("useRoutesMap")

export type RouterLocation = {
  params: Record<string, string>
  query: Record<string, any>
  pathname: string
  meta: any
  [key: string]: any
}
export let useRouter = createEmptyHook<() => RouterLocation>("useRouter")

export let useLoader =
  createEmptyHook<() => ["success", any] | ["loading", null] | ["fail", any]>(
    "useLoader"
  )

export type SSRProps = {
  req: Request
  headers: Record<string, string>
  mode: string
  serverMode: string
  logger:  Record<string, (...message: string[]) => any>
  inputs: Record<string, string>
  outputs: Record<string, string>
  meta: any
  query: Record<string, any>
  params: Record<string, any>
  [key: string]: any
}

export let useServer =
  createEmptyHook<(fn: (context: SSRProps) => any) => Promise<void>>(
    "useServer"
  )

export let useServerData: <T>(
  id: string,
  fn: (ctx: SSRProps) => T | Promise<T>
) => T = createEmptyHook<any>("useServerData")

export let useServerRouteData = createEmptyHook<() => any>("useServerRouteData")

export function registryHook(name: string, hook: any) {
  switch (name) {
    case "useRoutes":
      useRoutes = hook
      return true
    case "useRoutesMap":
      useRoutesMap = hook
      return true
    case "useRouter":
      useRouter = hook
      return true
    case "useLoader":
      useLoader = hook
      return true
    case "useServer":
      useServer = hook
      return true
    case "useServerData":
      useServerData = hook
      return true
    case "useServerRouteData":
      useServerRouteData = hook
      return true
  }
  return false
}
