import { AlbumUserPlugin } from "../../context/context.type.js"

type Keys = keyof Omit<AlbumUserPlugin, "name">
type GetPluginParams<T> = T extends (params: infer P) => any? P : never
type Props<T extends Keys> = GetPluginParams<Required<AlbumUserPlugin>[T]>
export async function callPluginWithCatch<T extends Keys>(key: T, plugins: AlbumUserPlugin[], props: Props<T>, onError: (e: any) => any) {
  for (const pg of plugins) {
    try {
      const fn: any = pg[key]
      if (fn) await fn(props)
    } catch (e) {
      onError(e)
    }
  }
  return props
}
