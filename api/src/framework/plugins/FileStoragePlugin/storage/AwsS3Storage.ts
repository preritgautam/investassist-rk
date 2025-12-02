import {
  CopyObjectCommand, CopyObjectCommandInput,
  DeleteObjectCommand,
  DeleteObjectCommandInput, GetObjectCommand, GetObjectCommandInput,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import { AbstractStorage, FileData } from './AbstractStorage';
import { RequestPresigningArguments } from '@aws-sdk/types';

type AWSS3Path = {
  Bucket: string,
  Key: string,
}

export type AwsS3StorageOptions = {
  region: string,
  accessKeyId: string,
  secretAccessKey: string,
  bucketKeySeparator?: string,
  defaultBucket?: string,
}

export type AwsS3StorageCreateOptions = Omit<PutObjectCommandInput, 'Body' | 'Key' | 'Bucket'>
export type AwsS3StorageReadOptions = Omit<GetObjectCommandInput, 'Key' | 'Bucket'>
export type AwsS3StorageDeleteOptions = Omit<DeleteObjectCommandInput, 'Key' | 'Bucket'>
export type AwsS3StorageCopyOptions = Omit<CopyObjectCommandInput, 'Key' | 'Bucket' | 'CopySource'>
export type AwsS3StorageMoveOptions = {
  copy?: AwsS3StorageCopyOptions,
  delete?: AwsS3StorageDeleteOptions,
}

export class AwsS3Storage extends AbstractStorage {
  private client: S3Client;

  constructor(
    private readonly config: AwsS3StorageOptions,
  ) {
    super();
    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  private getBucketAndKeyFromFilePath(filePath: string): AWSS3Path {
    if (!this.config.defaultBucket) {
      const slashIndex = filePath.indexOf(this.config.bucketKeySeparator ?? '/');
      if (slashIndex === -1) {
        throw new Error('Invalid AWS S3 file name');
      }
      return {
        Bucket: filePath.substr(0, slashIndex),
        Key: filePath.substr(slashIndex + 1),
      };
    } else {
      return {
        Bucket: this.config.defaultBucket,
        Key: filePath,
      };
    }
  }

  async copyFile(
    sourceServerFilePath: string,
    destinationServerFilePath: string,
    options: AwsS3StorageCopyOptions = {},
  ): Promise<any> {
    if (!sourceServerFilePath.startsWith('/')) {
      sourceServerFilePath = '/' + sourceServerFilePath;
    }
    const copyCommand = new CopyObjectCommand({
      ...options,
      CopySource: sourceServerFilePath,
      ...this.getBucketAndKeyFromFilePath(destinationServerFilePath),
    });
    return this.client.send(copyCommand);
  }

  async createFile(
    serverFilePath: string,
    fileData: FileData | Promise<FileData>,
    options: AwsS3StorageCreateOptions = {},
  ): Promise<any> {
    const putCommand = new PutObjectCommand({
      ...options,
      Body: await fileData,
      ...this.getBucketAndKeyFromFilePath(serverFilePath),
    });
    return this.client.send(putCommand);
  }

  async deleteFile(serverFilePath: string, options: AwsS3StorageDeleteOptions = {}): Promise<any> {
    const deleteCommand = new DeleteObjectCommand({
      ...options,
      ...this.getBucketAndKeyFromFilePath(serverFilePath),
    });
    return this.client.send(deleteCommand);
  }

  async moveFile(
    sourceServerFilePath: string,
    destinationServerFilePath: string,
    options: AwsS3StorageMoveOptions = {},
  ): Promise<any> {
    await this.copyFile(sourceServerFilePath, destinationServerFilePath, options.copy || {});
    return this.deleteFile(sourceServerFilePath, options.delete || {});
  }

  async readFile(serverFilePath: string, options: AwsS3StorageReadOptions = {}): Promise<Readable> {
    const getCommand = new GetObjectCommand({
      ...options,
      ...this.getBucketAndKeyFromFilePath(serverFilePath),
    });
    const response = await this.client.send(getCommand);
    return <Readable>response.Body;
  }

  async getUrl(serverFilePath: string, options: RequestPresigningArguments = {}): Promise<string> {
    const command = new GetObjectCommand({
      ...this.getBucketAndKeyFromFilePath(serverFilePath),
    });
    return getSignedUrl(this.client, command, options);
  }
}
