import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/modules/database.module";
import { UserModule } from "./user.module";
import { YousignService } from "../use-cases/yousign/signature.use-case";

@Module({
  imports: [DatabaseModule, UserModule],
  providers: [YousignService],
  exports: [YousignService],
})
export class YousignModule {}
