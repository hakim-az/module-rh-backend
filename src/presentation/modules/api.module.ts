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
import { DashboardController } from "../controllers/dashboard.controller";
import { SignupController } from "../controllers/signup.controller";
import { UserInitService } from "@/domain/services/user-init-.service";
import { LoginController } from "../controllers/login.controller";
import { NotificationController } from "../controllers/notification.controller";
import { NotificationModule } from "@/application/modules/notification.module";
import { SendgridModule } from "@/application/modules/sendgrid.module";
import { ContratCommercialController } from "../controllers/ContractGenerationControllers/commercial.controller";
import { ContratCdiController } from "../controllers/ContractGenerationControllers/cdi.controllers";
import { ContratNonCdiController } from "../controllers/ContractGenerationControllers/non-cdi.controller";
import { EmailVerificationController } from "../controllers/email-verification.controller";
import { EmailVerificationModule } from "@/application/modules/email-verification.module";
import { YousignIframeController } from "../controllers/ContractSignControllers/yousign-iframe.controller";

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
    EmailVerificationModule,
  ],
  controllers: [
    UserController,
    FileController,
    ContratController,
    AbsenceController,
    CoffreController,
    RestauController,
    DashboardController,
    SignupController,
    LoginController,
    NotificationController,
    ContratCommercialController,
    ContratCdiController,
    ContratNonCdiController,
    EmailVerificationController,
    YousignIframeController,
  ],
  providers: [UserInitService],
})
export class ApiModule {}
