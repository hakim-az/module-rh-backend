import { Module } from "@nestjs/common";
import { UserModule } from "../../application/modules/user.module";
import { FileModule } from "../../application/modules/file.module";
import { ContratModule } from "../../application/modules/contrat.module";
import { UserController } from "../controllers/user.controller";
import { FileController } from "../controllers/file.controller";
import { ContratController } from "../controllers/contrat.controller";

@Module({
  imports: [UserModule, FileModule, ContratModule],
  controllers: [UserController, FileController, ContratController],
})
export class ApiModule {}
