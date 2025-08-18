import { Module } from "@nestjs/common";
import { UserModule } from "../../application/modules/user.module";
import { FileModule } from "../../application/modules/file.module";
import { ContratModule } from "../../application/modules/contrat.module";
import { AbsenceModule } from "../../application/modules/absence.module";
import { CoffreModule } from "../../application/modules/coffre.module";
import { RestauModule } from "../../application/modules/restau.module";
import { YousignModule } from "../../application/modules/yousign.module";

import { UserController } from "../controllers/user.controller";
import { FileController } from "../controllers/file.controller";
import { ContratController } from "../controllers/contrat.controller";
import { AbsenceController } from "../controllers/absence.controller";
import { CoffreController } from "../controllers/coffre.controller";
import { RestauController } from "../controllers/restau.controller";
import { YousignController } from "../controllers/yousign.controller";
import { DashboardController } from "../controllers/dashboard.controller";
import { HolidayCalculationController } from "../controllers/holidays-calculation.controller";

@Module({
  imports: [
    UserModule,
    FileModule,
    ContratModule,
    AbsenceModule,
    CoffreModule,
    RestauModule,
    YousignModule,
  ],
  controllers: [
    UserController,
    FileController,
    ContratController,
    AbsenceController,
    CoffreController,
    RestauController,
    YousignController,
    DashboardController,
    HolidayCalculationController,
  ],
})
export class ApiModule {}
