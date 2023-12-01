import { Global, Module } from "@nestjs/common"
import { AlbumContextModule } from "../context/album-context.module.js"
import { SSRController } from "./ssr.controller.js"
import { SSRService } from "./ssr.service.js"

@Global()
@Module({
  imports: [AlbumContextModule],
  controllers: [SSRController],
  providers: [SSRService],
  exports: [SSRService]
})
export class SSRModule {}
