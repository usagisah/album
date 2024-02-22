import type { LocalData } from "album"
import React from "react"

export type RouteLoaderStage = "loading" | "success" | "fail"
export type RouteLoaderValue = { value: any; pending: ((stage: RouteLoaderStage, value: any) => any)[]; stage: RouteLoaderStage }

export type RouteContextValue = {
  loader: Map<string, RouteLoaderValue>
  localData: LocalData
  parentContext?: RouteContextValue
}

export const RouteContext = React.createContext<RouteContextValue>(null as any)
