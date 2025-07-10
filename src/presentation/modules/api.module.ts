import { Module } from "@nestjs/common";
import { UserModule } from "../../application/modules/user.module";
import { FileModule } from "../../application/modules/file.module";
import { ContratModule } from "../../application/modules/contrat.module";
import { AbsenceModule } from "../../application/modules/absence.module";
import { CoffreModule } from "../../application/modules/coffre.module";

import { UserController } from "../controllers/user.controller";
import { FileController } from "../controllers/file.controller";
import { ContratController } from "../controllers/contrat.controller";
import { AbsenceController } from "../controllers/absence.controller";
import { CoffreController } from "../controllers/coffre.controller";

@Module({
  imports: [UserModule, FileModule, ContratModule, AbsenceModule, CoffreModule],
  controllers: [
    UserController,
    FileController,
    ContratController,
    AbsenceController,
    CoffreController,
  ],
})
export class ApiModule {}
