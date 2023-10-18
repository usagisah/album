import { Global, Module } from "@nestjs/common"
import { AlbumContextService } from "./album-context.service.js"

@Global()
@Module({
  imports: [],
  providers: [AlbumContextService],
  exports: [AlbumContextService]
})
export class AlbumContextModule {}
