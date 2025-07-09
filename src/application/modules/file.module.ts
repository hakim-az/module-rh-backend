import { Module } from "@nestjs/common";
import { StorageModule } from "../../infrastructure/modules/storage.module";
import { UploadFileUseCase } from "../../application/use-cases/file/upload-file.use-case";
import { DownloadFileUseCase } from "../../application/use-cases/file/download-file.use-case";
import { GetFileUrlUseCase } from "../../application/use-cases/file/get-file-url.use-case";
import { DeleteFileUseCase } from "../../application/use-cases/file/delete-file.use-case";

@Module({
  imports: [StorageModule],
  providers: [
    UploadFileUseCase,
    DownloadFileUseCase,
    GetFileUrlUseCase,
    DeleteFileUseCase,
  ],
  exports: [
    UploadFileUseCase,
    DownloadFileUseCase,
    GetFileUrlUseCase,
    DeleteFileUseCase,
  ],
})
export class FileModule {}
