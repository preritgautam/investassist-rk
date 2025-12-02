import { CacheOptions } from '../CachePlugin';
import { CacheFactory } from './CacheFactory';
import { ServiceContainer } from '../../../core/container';

export class CacheBuilder {
  constructor(
    private readonly ns: string,
    private readonly cacheFactory: CacheFactory,
    private readonly caches: Record<string, CacheOptions>,
  ) {
  }

  buildCaches(serviceContainer: ServiceContainer) {
    Reflect.ownKeys(this.caches).forEach((cacheName: string) => {
      const cacheOptions = this.caches[cacheName];
      const cache = this.cacheFactory.buildCache(cacheOptions);
      serviceContainer.container.factory(`${this.ns}.cache.${cacheName}`, {
        factoryFunction: () => cache,
      });
    });
  }
}
