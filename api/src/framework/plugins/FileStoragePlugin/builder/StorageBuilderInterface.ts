import { AbstractStorage } from '../storage/AbstractStorage';

export interface StorageBuilderInterface<StorageOptions> {
  getType(): string;
  build(options: StorageOptions): AbstractStorage | Promise<AbstractStorage>;
}
