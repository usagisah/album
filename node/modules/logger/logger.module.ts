import { DynamicModule, Module } from "@nestjs/common"
import { createAlbumLoggerService } from "./logger.service.js"
import { ILogger } from "./logger.type.js"

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
