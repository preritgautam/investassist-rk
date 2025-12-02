import { StorageBuilderLocator } from './StorageBuilderLocator';
import { StorageBuilderInterface } from '../builder/StorageBuilderInterface';
import { StorageOptions } from '../FileStoragePlugin';
import { AbstractStorage } from '../storage/AbstractStorage';

export class StorageFactory {
  private buildersMap = new Map<string, StorageBuilderInterface<any>>();
  constructor(
    private readonly locator: StorageBuilderLocator,
  ) {
  }

  async loadBuilders() {
    const builders: StorageBuilderInterface<any>[] = await this.locator.resolveAll();
    for (const builder of builders) {
      this.buildersMap.set(builder.getType(), builder);
    }
  }


  async buildStorages(storages: Record<string, StorageOptions>) {
    const createdStorages: Record<string, AbstractStorage> = {};
    const storageNames = Reflect.ownKeys(storages) as string[];
    for (const name of storageNames) {
      const storageOptions = storages[name];
      const builder = this.buildersMap.get(storageOptions.storage);
      if (!builder) {
        throw new Error('Unknown storage type requested. Did you register the storage builder with correct type?');
      }

      createdStorages[name] = await builder.build(storageOptions.options);
    }

    return createdStorages;
  }
}
