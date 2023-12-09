import { DynamicModule, Module } from "@nestjs/common"
import { AlbumContext } from "../../context/context.type.js"
import { createAlbumServer } from "./album-context.service.js"

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
