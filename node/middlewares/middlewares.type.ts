import { InlineConfig, UserConfig } from "vite"

export type ViteConfig = InlineConfig
export type ViteUserConfig = UserConfig

export type ViteConfigs = {
  name: string
  options: ViteConfig | ViteUserConfig | InlineConfig | UserConfig
}

export type MiddlewareConfigs = Map<string, { config: any[]; factory: (...config: any[]) => any }>
