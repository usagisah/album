import compression from "compression"
import helmet from "helmet"
import sirv, { Options as SirvOptions } from "sirv"
import { AlbumDevContext } from "../../context/context.type.js"
import { AlbumServerExpressConfig } from "../middlewares.type.js"

export function expressOptimizeConfigs(context: AlbumDevContext) {
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

const sirvConfig = function (outDir: string, dev: boolean, single: boolean): AlbumServerExpressConfig {
  return {
    enable: true,
    name: "sirv",
    config: [outDir, { dev, gzip: true, etag: false, dotfiles: false, brotli: false, single, extensions: ["html"], maxAge: 31536000, immutable: true, ignores: ["manifest.json"] } as SirvOptions],
    factory: async (...config: any[]) => sirv.apply(globalThis, config)
  }
}

function devOptions(context: AlbumDevContext): AlbumServerExpressConfig[] {
  const { outputs, ssr } = context.info
  return [{ ...helmetConfig, enable: true }, { ...compressionConfig, enable: true }, sirvConfig(outputs.clientOutDir, true, !ssr)]
}

function prodOptions(context: AlbumDevContext): AlbumServerExpressConfig[] {
  const { outputs, ssr } = context.info
  return [helmetConfig, compressionConfig, sirvConfig(outputs.clientOutDir, false, !ssr)]
}
