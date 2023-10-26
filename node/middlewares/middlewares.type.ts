import { InlineConfig, UserConfig } from "vite"

export type ViteConfig = InlineConfig

export type ViteUserConfig = UserConfig

export type PluginViteConfig = {
  name: string
  options: ViteUserConfig
}

export type MiddlewareConfigs = Map<string, { config: any[]; factory: (...config: any[]) => any }>
