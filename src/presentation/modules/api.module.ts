import { Module } from "@nestjs/common";
import { UserModule } from "../../application/modules/user.module";
import { FileModule } from "../../application/modules/file.module";
import { UserController } from "../controllers/user.controller";
import { FileController } from "../controllers/file.controller";

@Module({
  imports: [UserModule, FileModule],
  controllers: [UserController, FileController],
})
export class ApiModule {}
