import { Global, Module } from "@nestjs/common"
import { AlbumContextService } from "./album-context.service.js"

@Global()
@Module({
  providers: [AlbumContextService],
  exports: [AlbumContextService]
})
export class AlbumContextModule {}
