// src/modules/aws/s3.service.ts
import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
  _Object,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get<string>("AWS_S3_BUCKET_NAME")!;
    this.region = this.configService.get<string>("AWS_S3_REGION")!;
    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.configService.get<string>("AWS_ACCESS_KEY_ID")!,
        secretAccessKey: this.configService.get<string>(
          "AWS_SECRET_ACCESS_KEY"
        )!,
      },
    });
  }

  /* ---------------- Upload / Download / Signed URL ---------------- */

  async uploadBuffer(
    buffer: Buffer,
    key: string,
    contentType: string
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      });
      await this.s3Client.send(command);
      return key;
    } catch (error) {
      this.logger.error(
        `Failed to upload buffer to S3 for key ${key}`,
        error as any
      );
      throw new InternalServerErrorException("S3 upload failed.");
    }
  }

  async downloadFile(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      const response = await this.s3Client.send(command);
      // @ts-ignore - Body est un stream Readable
      const stream = response.Body as NodeJS.ReadableStream;
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }
      return Buffer.concat(chunks);
    } catch (error) {
      this.logger.error(
        `Failed to download file from S3: ${key}`,
        error as any
      );
      throw new InternalServerErrorException(
        "Could not download file from S3."
      );
    }
  }

  async getPresignedUrl(key: string, expiresIn: number = 600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      return getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      this.logger.error(
        `Failed to generate presigned URL for key ${key}`,
        error as any
      );
      throw new InternalServerErrorException(
        "Could not generate S3 presigned URL."
      );
    }
  }

  /* ---------------- Existence & Deletion ---------------- */

  /** Vérifie si un objet existe (HEAD). Ne jette pas d'erreur si 404. */
  async exists(key: string): Promise<boolean> {
    try {
      await this.s3Client.send(
        new HeadObjectCommand({ Bucket: this.bucketName, Key: key })
      );
      return true;
    } catch (error: any) {
      const status = error?.$metadata?.httpStatusCode;
      if (
        status === 404 ||
        error?.name === "NotFound" ||
        error?.Code === "NotFound"
      ) {
        return false;
      }
      // Pour toute autre erreur inattendue, on log et considère "non trouvé"
      this.logger.warn(`HEAD failed for key ${key}`, error);
      return false;
    }
  }

  /** Supprime un objet par sa clé (idempotent côté S3). */
  async deleteObject(key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({ Bucket: this.bucketName, Key: key })
      );
    } catch (error) {
      this.logger.error(`Failed to delete S3 object: ${key}`, error as any);
      throw new InternalServerErrorException("S3 delete failed.");
    }
  }

  /**
   * (Optionnel) Supprime tous les objets sous un préfixe.
   * Retourne le nombre d’objets supprimés.
   */
  async deleteByPrefix(prefix: string): Promise<number> {
    let deleted = 0;
    let ContinuationToken: string | undefined;

    try {
      do {
        const listed = await this.s3Client.send(
          new ListObjectsV2Command({
            Bucket: this.bucketName,
            Prefix: prefix,
            ContinuationToken,
          })
        );

        const contents = (listed.Contents ?? []) as _Object[];
        if (contents.length > 0) {
          await this.s3Client.send(
            new DeleteObjectsCommand({
              Bucket: this.bucketName,
              Delete: {
                Objects: contents.map((o) => ({ Key: o.Key! })),
                Quiet: true,
              },
            })
          );
          deleted += contents.length;
        }

        ContinuationToken = listed.IsTruncated
          ? listed.NextContinuationToken
          : undefined;
      } while (ContinuationToken);

      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete by prefix: ${prefix}`, error as any);
      throw new InternalServerErrorException("S3 prefix delete failed.");
    }
  }
}
