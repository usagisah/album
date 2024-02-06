import { Module } from "@nestjs/common"
import { SSRController } from "./ssr.controller.js"

@Module({
  controllers: [SSRController]
})
export class SSRModule {}
