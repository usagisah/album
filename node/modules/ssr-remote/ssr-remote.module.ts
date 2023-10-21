import { Module } from "@nestjs/common"
import { SsrRemoteController } from "./ssr-remote.controller.js"

@Module({
  controllers: [SsrRemoteController]
})
export class SsrRemoteModule {}
