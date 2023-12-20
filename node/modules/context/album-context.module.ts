import { DynamicModule, Module } from "@nestjs/common"
import { createAlbumServer } from "./album-context.service.js"
import { AlbumContext } from "./album-context.type.js"

@Module({})
export class AlbumContextModule {
  static forRoot(ctx: AlbumContext): DynamicModule {
    const ctxService = createAlbumServer(ctx)
    return {
      global: true,
      module: AlbumContextModule,
      providers: [ctxService],
      exports: [ctxService]
    }
  }
}
