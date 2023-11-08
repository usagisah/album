import compression from "compression"
import helmet from "helmet"
import sirv, { Options as SirvOptions } from "sirv"
import { AlbumDevContext, AlbumStartContext } from "../../context/context.type.js"
import { AlbumServerExpressConfig } from "../middlewares.type.js"

type Context = AlbumDevContext | AlbumStartContext

export function expressConfigs(context: Context) {
  return context.info.mode === "production" ? prodOptions(context) : devOptions(context)
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
    config: [root, { dev, gzip: true, etag: false, dotfiles: false, brotli: false, single, extensions: ["html"], maxAge: 31536000, immutable: true, ignores: ["manifest.json"] } as SirvOptions],
    factory: async (...config: any[]) => sirv.apply(globalThis, config)
  }
}

function devOptions(context: Context): AlbumServerExpressConfig[] {
  const { serverMode, ssr } = context.info
  const root = serverMode === "start" ? (context as AlbumStartContext).info.inputs.ssrInput! : (context as AlbumDevContext).info.outputs.clientOutDir
  return [{ ...helmetConfig, enable: true }, { ...compressionConfig, enable: true }, sirvConfig(root, true, !ssr)]
}

function prodOptions(context: Context): AlbumServerExpressConfig[] {
  const { serverMode, ssr } = context.info
  const root = serverMode === "start" ? (context as AlbumStartContext).info.inputs.ssrInput! : (context as AlbumDevContext).info.outputs.clientOutDir
  return [helmetConfig, compressionConfig, sirvConfig(root, false, !ssr)]
}
