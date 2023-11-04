import { Module } from "@nestjs/common"
import { SsrController } from "./ssr.controller.js"

@Module({
  controllers: [SsrController]
})
export class SsrModule {}
