import { StorageBuilderInterface } from './StorageBuilderInterface';
import { FileSystemStorage, FileSystemStorageOptions } from '../storage/FileSystemStorage';

export class FileSystemStorageBuilder implements StorageBuilderInterface<FileSystemStorageOptions> {
  getType(): string {
    return 'fileSystem';
  }

  build(options: FileSystemStorageOptions): FileSystemStorage {
    return new FileSystemStorage(options);
  }
}
