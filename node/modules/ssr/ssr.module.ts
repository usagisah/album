import { Module } from "@nestjs/common"
import { AlbumContextModule } from "../context/album-context.module.js"
import { SSRComposeModule } from "../ssr-compose/ssr-compose.module.js"
import { SSRController } from "./ssr.controller.js"
import { SSRService } from "./ssr.service.js"

@Module({
  imports: [AlbumContextModule, SSRComposeModule],
  controllers: [SSRController],
  providers: [SSRService],
  exports: [SSRService]
})
export class SSRModule {}
