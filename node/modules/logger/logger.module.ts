import { DynamicModule, Module } from "@nestjs/common"
import { ILogger } from "../../logger/logger.type.js"
import { createAlbumLoggerService } from "./logger.service.js"

@Module({})
export class LoggerModule {
  static forRoot(logger: ILogger): DynamicModule {
    const loggerService = createAlbumLoggerService(logger)
    return {
      global: true,
      module: LoggerModule,
      providers: [loggerService],
      exports: [loggerService]
    }
  }
}
