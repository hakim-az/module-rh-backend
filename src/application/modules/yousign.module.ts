import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/modules/database.module";
import { YousignService } from "../use-cases/yousign/signature.use-case";

@Module({
  imports: [DatabaseModule],
  providers: [YousignService],
  exports: [YousignService],
})
export class YousignModule {}
