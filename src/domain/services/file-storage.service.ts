export const FileStorageService = Symbol("FileStorageService");

export interface FileStorageService {
  uploadFile(file: Buffer, fileName: string, mimeType: string): Promise<string>;
  downloadFile(fileName: string): Promise<Buffer>;
  deleteFile(fileName: string): Promise<void>;
  getFileUrl(fileName: string): Promise<string>;
}
