import { Injectable, Inject } from "@nestjs/common";
import { FileStorageService } from "../../../domain/services/file-storage.service";

@Injectable()
export class GetFileUrlUseCase {
  constructor(
    @Inject(FileStorageService)
    private readonly fileStorageService: FileStorageService
  ) {}

  async execute(fileName: string): Promise<string> {
    return this.fileStorageService.getFileUrl(fileName);
  }
}
