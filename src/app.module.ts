import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ApiModule } from "./presentation/modules/api.module";
import databaseConfig from "./infrastructure/config/database.config";
import awsConfig from "./infrastructure/config/aws.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, awsConfig],
    }),
    ApiModule,
  ],
})
export class AppModule {}
