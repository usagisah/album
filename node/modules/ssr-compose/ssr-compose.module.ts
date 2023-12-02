import { Module } from "@nestjs/common"
import { SSRComposeController } from "./ssr-compose.controller.js"

@Module({
  controllers: [SSRComposeController]
})
export class SSRComposeModule {}
