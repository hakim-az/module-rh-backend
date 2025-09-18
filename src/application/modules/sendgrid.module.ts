import { Module } from "@nestjs/common";
import { SendgridService } from "@/domain/services/sendgrid.service";

@Module({
  providers: [SendgridService],
  exports: [SendgridService], // ⚡ permet d'utiliser le service ailleurs
})
export class SendgridModule {}
