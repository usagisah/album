import helmet from "helmet"
import { AlbumContext } from "../../context/AlbumContext.type.js"
import { MiddlewareConfigs } from "../middlewares.type.js"

export function expressOptimizeConfigs(context: AlbumContext) {
  const { mode } = context
  return mode === "production" ? prodOptions(context) : devOptions(context)
}

function devOptions(context: AlbumContext): MiddlewareConfigs {
  return new Map([])
}

function prodOptions(context: AlbumContext): MiddlewareConfigs {
  const { outputs } = context
  return new Map([
    [
      "helmet",
      {
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
        factory: async (...config: any[]) => {
          return helmet.apply(globalThis, config)
        }
      }
    ],
    [
      "compression",
      {
        config: [{ level: 7 }],
        factory: async (...config: any[]) => {
          const compression = await import("compression")
          return compression.default.apply(globalThis, config)
        }
      }
    ],
    [
      "serve-static",
      {
        config: [outputs.clientOutDir, {}],
        factory: async function (...config: any[]): Promise<any> {
          const serverStatic = await import("serve-static")
          const _serverStatic = serverStatic.default.apply(globalThis, config)
          return (req: any, res: any, next: any) => {
            if (req.path === "/manifest.json") {
              return next()
            }
            return _serverStatic(req, res, next)
          }
        }
      }
    ]
  ] as any)
}
