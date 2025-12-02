import { AbstractPlugin } from '../../core/plugins/AbstractPlugin';
import { ServiceContainer } from '../../core/container';
import { MemoryCacheOptions } from './engines/MemoryCache';
import { CacheFactory } from './service/CacheFactory';
import { CacheBuilder } from './service/CacheBuilder';
import { CacheResolver } from './service/CacheResolver';
import { cacheable } from './decorators/cacheable';

export type CacheOptions = {
  type: 'memory',
  options: MemoryCacheOptions
}

export interface CachePluginOptions {
  caches: Record<string, CacheOptions>;
}

export class CachePlugin extends AbstractPlugin {
  getDefaultNamespace() {
    return 'cache';
  }

  getDefaultConfig(): CachePluginOptions {
    return {
      caches: {
        default: {
          type: 'memory',
          options: {
            stdTTL: 600,
          },
        },
      },
    };
  }

  registerServices(serviceContainer: ServiceContainer, config: CachePluginOptions) {
    const { container, decorators: { injectable } } = serviceContainer;
    cacheable.container = container;
    injectable()(CacheFactory);
    injectable({
      getDependenciesList: async (resolve) => [
        this._namespace,
        await resolve(CacheFactory),
        config.caches,
      ],
    })(CacheBuilder);
    injectable({
      getDependenciesList: () => [this._namespace, serviceContainer],
    })(CacheResolver);
  }


  async start(serviceContainer: ServiceContainer): Promise<void> {
    const builder: CacheBuilder = await serviceContainer.container.resolve(CacheBuilder);
    builder.buildCaches(serviceContainer);
  }
}
