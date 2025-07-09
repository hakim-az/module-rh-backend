import { Injectable, Inject } from "@nestjs/common";

import { FileStorageService } from "../../../domain/services/file-storage.service";

@Injectable()
export class UploadFileUseCase {
  constructor(
    @Inject(FileStorageService)
    private readonly fileStorageService: FileStorageService
  ) {}

  async execute(
    file: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<string> {
    return this.fileStorageService.uploadFile(file, fileName, mimeType);
  }
}
