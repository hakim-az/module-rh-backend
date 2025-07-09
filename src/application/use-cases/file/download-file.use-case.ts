import { Injectable, Inject } from "@nestjs/common";
import { FileStorageService } from "../../../domain/services/file-storage.service";

@Injectable()
export class DownloadFileUseCase {
  constructor(
    @Inject(FileStorageService)
    private readonly fileStorageService: FileStorageService
  ) {}

  async execute(fileName: string): Promise<Buffer> {
    return this.fileStorageService.downloadFile(fileName);
  }
}
