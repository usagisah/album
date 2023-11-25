import { Module } from "@nestjs/common"
import { AlbumContextModule } from "../context/album-context.module.js"
import { SSRModule } from "../ssr/ssr.module.js"
import { SSRComposeController } from "./ssr-compose.controller.js"
import { SSRComposeService } from "./ssr-compose.service.js"

@Module({
  imports: [AlbumContextModule, SSRModule],
  controllers: [SSRComposeController],
  providers: [SSRComposeService],
  exports: [SSRComposeService]
})
export class SSRComposeModule {}
