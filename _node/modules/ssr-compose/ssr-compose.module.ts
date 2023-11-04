import { Module } from "@nestjs/common"
import { SsrComposeController } from "./ssr-compose.controller.js"

@Module({
  controllers: [SsrComposeController]
})
export class SsrComposeModule {}
