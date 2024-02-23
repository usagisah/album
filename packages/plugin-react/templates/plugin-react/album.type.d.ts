/// <reference types="@albumjs/album/types/vite-client" />
/// <reference types="@albumjs/album/types/express" />
/// <reference types="../../album" />

import { Context } from "react"
declare module "album.dependency" {
  export const RouteContext: Context<any>
  export const SSRContext: Context<{ context: any; getSSRProps: () => any }>
  export type RouteLoaderStage = "loading" | "success" | "fail"
  export type RouteLoaderValue = { value: any; pending: ((stage: RouteLoaderStage, value: any) => any)[]; stage: RouteLoaderStage }
  export type RouteContextValue = {
    loader: Map<string, RouteLoaderValue>
    localData: any
    parentContext?: RouteContextValue
  }
  export const createRemoteAppLoader: any
}
