import * as path from 'path';
import * as fs from 'fs';
import { Readable } from 'stream';
import { promises as fsp } from 'fs';
import { AbstractStorage, FileData } from './AbstractStorage';

export interface FileSystemStorageOptions {
  serverRootPath: string,
}

export class FileSystemStorage extends AbstractStorage {
  constructor(private readonly options: FileSystemStorageOptions) {
    super();
  }

  private serverPath(filePath: string): string {
    return path.join(this.options.serverRootPath, filePath);
  }

  private async ensurePath(serverFilePath: string) {
    const dirname = path.dirname(this.serverPath(serverFilePath));
    await fsp.mkdir(dirname, { recursive: true });
  }

  async copyFile(serverFilePath1: string, serverFilePath2: string): Promise<any> {
    await this.ensurePath(serverFilePath2);
    return fsp.copyFile(
      this.serverPath(serverFilePath1), this.serverPath(serverFilePath2),
    );
  }

  async createFile(serverFilePath: string, fileData: FileData | Promise<FileData>): Promise<any> {
    const data = await fileData;
    await this.ensurePath(serverFilePath);

    if (data instanceof Buffer || typeof data === 'string') {
      return fsp.writeFile(this.serverPath(serverFilePath), data);
    } else if (data instanceof Readable) {
      const stream = fs.createWriteStream(this.serverPath(serverFilePath));
      return new Promise((resolve, reject) => {
        stream.on('end', resolve);
        stream.on('error', reject);
        data.on('error', reject);
        data.pipe(stream);
      });
    } else {
      throw new Error('Unknown data format to create file');
    }
  }

  async deleteFile(serverFilePath: string): Promise<any> {
    return fsp.unlink(this.serverPath(serverFilePath));
  }

  async downloadFile(serverFilePath: string, localFilePath: string): Promise<any> {
    return fsp.copyFile(this.serverPath(serverFilePath), localFilePath);
  }

  async moveFile(serverFilePath1: string, serverFilePath2: string): Promise<any> {
    await this.ensurePath(serverFilePath2);
    return fsp.rename(this.serverPath(serverFilePath1), this.serverPath(serverFilePath2));
  }

  async readFile(serverFilePath: any): Promise<Readable> {
    return Promise.resolve(fs.createReadStream(this.serverPath(serverFilePath)));
  }

  async uploadFile(localFilePath: string, serverFilePath: string): Promise<any> {
    await this.ensurePath(serverFilePath);
    return fsp.copyFile(localFilePath, this.serverPath(serverFilePath));
  }

  async getUrl(serverFilePath: string): Promise<string> {
    return serverFilePath;
  }
}
