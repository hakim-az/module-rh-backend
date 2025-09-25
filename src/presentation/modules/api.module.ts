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
import { SignupController } from "../controllers/signup.controller";
import { UserInitService } from "@/domain/services/user-init-.service";
import { LoginController } from "../controllers/login.controller";
import { NotificationController } from "../controllers/notification.controller";
import { NotificationModule } from "@/application/modules/notification.module";
import { SendgridModule } from "@/application/modules/sendgrid.module";
import { ContratCommercialController } from "../controllers/ContractGenerationControllers/commercial.controller";
import { YousignCommercialController } from "../controllers/ContractSignControllers/sign-commercial.controller";
import { ContratCdiController } from "../controllers/ContractGenerationControllers/cdi.controllers";
import { YousignCdiController } from "../controllers/ContractSignControllers/sign-cdi.controller";
import { ContratNonCdiController } from "../controllers/ContractGenerationControllers/non-cdi.controller";

@Module({
  imports: [
    UserModule,
    FileModule,
    ContratModule,
    AbsenceModule,
    CoffreModule,
    RestauModule,
    YousignModule,
    NotificationModule,
    SendgridModule,
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
    SignupController,
    LoginController,
    NotificationController,
    ContratCommercialController,
    YousignCommercialController,
    ContratCdiController,
    YousignCdiController,
    ContratNonCdiController,
  ],
  providers: [UserInitService],
})
export class ApiModule {}
