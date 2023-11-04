import { UserConfig } from "vite"

export type PluginViteConfig = {
  name: string
  options: UserConfig
}

export type MiddlewareConfigs = Map<string, { config: any[]; factory: (...config: any[]) => any }>
