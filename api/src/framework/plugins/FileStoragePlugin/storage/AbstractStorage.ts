import ReadableStream = NodeJS.ReadableStream;
import { Readable } from 'stream';
import * as fs from 'fs';

export type FileData = Readable | Buffer | string;

export abstract class AbstractStorage {
  abstract createFile(serverFilePath: string, fileData: FileData | Promise<FileData>, options: {}): Promise<any>;

  abstract deleteFile(serverFilePath: string, options: {}): Promise<any>;

  abstract getUrl(serverFilePath: string, options: {}): Promise<string>;

  abstract moveFile(serverFilePath1: string, serverFilePath2: string, options: {}): Promise<any>;

  abstract copyFile(serverFilePath1: string, serverFilePath2: string, options: {}): Promise<any>;

  abstract readFile(serverFilePath: string): Promise<Readable>;

  async uploadFile(localFilePath: string, serverFilePath: string): Promise<any> {
    const stream = fs.createReadStream(localFilePath);
    return this.createFile(serverFilePath, stream, {});
  }

  async downloadFile(serverFilePath: string, localFilePath: string): Promise<any> {
    const stream: ReadableStream = await this.readFile(serverFilePath);
    const writeStream = fs.createWriteStream(localFilePath);

    return new Promise((resolve, reject) => {
      stream.on('error', reject);
      writeStream.on('end', resolve);
      writeStream.on('error', reject);

      stream.pipe(writeStream);
    });
  }
}
