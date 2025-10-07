import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../infrastructure/modules/database.module";
import { UserModule } from "./user.module";
import { YousignIframeService } from "../use-cases/yousign/yousign-iframe.service";

@Module({
  imports: [DatabaseModule, UserModule],
  providers: [YousignIframeService],
  exports: [YousignIframeService],
})
export class YousignModule {}
