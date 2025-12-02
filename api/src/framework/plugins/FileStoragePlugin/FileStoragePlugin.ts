import { storageDecoratorFactory } from './decorator/storage';
import { StorageBuilderLocator } from './service/StorageBuilderLocator';
import { StorageFactory } from './service/StorageFactory';
import { FileSystemStorageBuilder } from './builder/FileSystemStorageBuilder';
import { AwsS3StorageBuilder } from './builder/AwsS3StorageBuilder';
import { AbstractPlugin } from '../../core/plugins/AbstractPlugin';
import { ServiceContainer } from '../../core/container';

export interface StorageOptions {
  storage: string,
  options?: any,
}

export interface FileStoragePluginOptions {
  storages: Record<string, StorageOptions>;
}

export class FileStoragePlugin extends AbstractPlugin {
  getDefaultNamespace(): string {
    return 'fileStorage';
  }

  getDefaultConfig(): FileStoragePluginOptions {
    return {
      storages: {
        default: {
          storage: 'fileSystem',
          options: {
            serverRootPath: './temp',
          },
        },
      },
    };
  }

  registerServices(serviceContainer: ServiceContainer) {
    const { decorators: { injectable, inject } } = serviceContainer;

    storageDecoratorFactory(serviceContainer, this._namespace, inject);

    injectable({ getDependenciesList: () => [this._namespace] })(StorageBuilderLocator);

    injectable({
      getDependenciesList: async (resolve) => [await resolve(StorageBuilderLocator)],
    })(StorageFactory);

    injectable({
      tags: [`${this._namespace}.storage.builder`],
    })(FileSystemStorageBuilder);

    injectable({
      tags: [`${this._namespace}.storage.builder`],
    })(AwsS3StorageBuilder);
  }

  async start(serviceContainer: ServiceContainer): Promise<void> {
    const { container } = serviceContainer;
    const factory = await container.resolve(StorageFactory);
    await factory.loadBuilders();

    const storages = await factory.buildStorages((this.config as FileStoragePluginOptions)?.storages ?? {});
    Reflect.ownKeys(storages).forEach((name) => {
      const storage = storages[name as string];
      container.factory(`${this._namespace}.storage.${name as string}`, {
        factoryFunction: () => storage,
      });
    });
  }
}
