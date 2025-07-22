// import { Injectable } from "@nestjs/common";
// import { ConfigService } from "@nestjs/config";
// import { FileStorageService } from "@domain/services/file-storage.service";
// import * as AWS from "aws-sdk";

// @Injectable()
// export class S3FileStorageService implements FileStorageService {
//   private s3: AWS.S3;
//   private bucketName: string;

//   constructor(private configService: ConfigService) {
//     this.s3 = new AWS.S3({
//       accessKeyId: this.configService.get("AWS_ACCESS_KEY_ID"),
//       secretAccessKey: this.configService.get("AWS_SECRET_ACCESS_KEY"),
//       region: this.configService.get("AWS_REGION"),
//     });
//     this.bucketName = this.configService.get("AWS_S3_BUCKET_NAME");
//   }

//   async uploadFile(
//     file: Buffer,
//     fileName: string,
//     mimeType: string
//   ): Promise<string> {
//     const key = `uploads/${Date.now()}-${fileName}`;

//     const params = {
//       Bucket: this.bucketName,
//       Key: key,
//       Body: file,
//       ContentType: mimeType,
//       ACL: "private",
//     };

//     try {
//       const result = await this.s3.upload(params).promise();
//       return result.Key;
//     } catch (error) {
//       throw new Error(`Failed to upload file: ${error.message}`);
//     }
//   }

//   async downloadFile(fileName: string): Promise<Buffer> {
//     const params = {
//       Bucket: this.bucketName,
//       Key: fileName,
//     };

//     try {
//       const result = await this.s3.getObject(params).promise();
//       return result.Body as Buffer;
//     } catch (error) {
//       throw new Error(`Failed to download file: ${error.message}`);
//     }
//   }

//   async deleteFile(fileName: string): Promise<void> {
//     const params = {
//       Bucket: this.bucketName,
//       Key: fileName,
//     };

//     try {
//       await this.s3.deleteObject(params).promise();
//     } catch (error) {
//       throw new Error(`Failed to delete file: ${error.message}`);
//     }
//   }

//   async getFileUrl(fileName: string): Promise<string> {
//     const params = {
//       Bucket: this.bucketName,
//       Key: fileName,
//       Expires: 3600, // 1 hour
//     };

//     try {
//       return this.s3.getSignedUrl("getObject", params);
//     } catch (error) {
//       throw new Error(`Failed to get file URL: ${error.message}`);
//     }
//   }
// }

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class S3FileStorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get("AWS_S3_REGION"),
      credentials: {
        accessKeyId: this.configService.get("AWS_ACCESS_KEY_ID"),
        secretAccessKey: this.configService.get("AWS_SECRET_ACCESS_KEY"),
      },
    });
    this.bucketName = this.configService.get("AWS_S3_BUCKET_NAME");
  }

  // async uploadFile(
  //   file: Buffer,
  //   fileName: string,
  //   mimeType: string
  // ): Promise<string> {
  //   const key = `uploads/${Date.now()}-${fileName}`;

  //   const command = new PutObjectCommand({
  //     Bucket: this.bucketName,
  //     Key: key,
  //     Body: file,
  //     ContentType: mimeType,
  //     ACL: "private",
  //   });

  //   try {
  //     await this.s3Client.send(command);
  //     return key;
  //   } catch (error: any) {
  //     throw new Error(`Failed to upload file: ${error.message}`);
  //   }
  // }

  async uploadFile(
    file: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<string> {
    const key = `uploads/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file,
      ContentType: mimeType,
      // ACL: "public-read",
    });

    try {
      await this.s3Client.send(command);

      const url = `https://${this.bucketName}.s3.${this.configService.get("AWS_S3_REGION")}.amazonaws.com/${key}`;
      return url; // ✅ This is a permanent public URL
    } catch (error: any) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async downloadFile(fileName: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
    });

    try {
      const response = await this.s3Client.send(command);
      // The Body is a stream, convert to buffer
      const stream = response.Body as ReadableStream | any;
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    } catch (error: any) {
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
    });

    try {
      await this.s3Client.send(command);
    } catch (error: any) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async getFileUrl(fileName: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
    });

    try {
      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600,
      });
      return url;
    } catch (error: any) {
      throw new Error(`Failed to get file URL: ${error.message}`);
    }
  }
}
