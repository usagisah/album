import compression from "compression"
import helmet from "helmet"
import sirv, { Options as SirvOptions } from "sirv"
import { AlbumContext as DevContext } from "../../context/context.dev.type.js"
import { AlbumContext as StartContext } from "../../context/context.start.type.js"
import { AlbumServerExpressConfig } from "../middlewares.type.js"

type Context = DevContext | StartContext

export function expressConfigs(context: Context) {
  if (context.serverMode === "build") return []
  return context.env.mode === "production" ? prodOptions(context) : devOptions(context)
}

const helmetConfig: AlbumServerExpressConfig = {
  enable: false,
  name: "helmet",
  config: [
    {
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          "script-src": ["'self'", "'unsafe-inline'"],
          "style-src": ["'self'", "'unsafe-inline'"]
        }
      }
    }
  ],
  factory: async (...config: any[]) => helmet.apply(globalThis, config)
}

const compressionConfig: AlbumServerExpressConfig = {
  enable: false,
  name: "compression",
  config: [{ level: 7 }],
  factory: async (...config: any[]) => compression.apply(globalThis, config)
}

const sirvConfig = function (root: string, dev: boolean, single: boolean): AlbumServerExpressConfig {
  return {
    enable: true,
    name: "sirv",
    config: [root, { dev, gzip: true, etag: false, dotfiles: false, brotli: false, single, extensions: ["html"], maxAge: 31536000, immutable: true } as SirvOptions],
    factory: async (...config: any[]) => sirv.apply(globalThis, config)
  }
}

function devOptions(context: Context): AlbumServerExpressConfig[] {
  const { serverMode, ssr } = context
  const isStart = serverMode === "start"
  const root = isStart ? (context as StartContext).inputs.ssrInput : (context as DevContext).outputs.clientOutDir
  return [
    { ...helmetConfig, enable: isStart },
    { ...compressionConfig, enable: isStart },
    { ...sirvConfig(root, true, !ssr), enable: isStart }
  ]
}

function prodOptions(context: Context): AlbumServerExpressConfig[] {
  const { serverMode, ssr } = context
  const isStart = serverMode === "start"
  const root = serverMode === "start" ? (context as StartContext).inputs.clientInput : (context as DevContext).outputs.clientOutDir
  return [
    { ...helmetConfig, enable: isStart },
    { ...compressionConfig, enable: isStart },
    { ...sirvConfig(root, false, !ssr), enable: isStart }
  ]
}
