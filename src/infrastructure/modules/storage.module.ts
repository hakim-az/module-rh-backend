import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { S3FileStorageService } from "../storage/s3-file-storage.service";
import { FileStorageService } from "../../domain/services/file-storage.service";

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: FileStorageService,
      useClass: S3FileStorageService,
    },
  ],
  exports: [FileStorageService],
})
export class StorageModule {}
