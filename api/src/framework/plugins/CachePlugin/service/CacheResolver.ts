import { ServiceContainer } from '../../../core/container';

export class CacheResolver {
  constructor(
    private readonly ns: string,
    private readonly container: ServiceContainer) {
  }

  async getCache(cacheName: string) {
    return this.container.container.resolve2(`${this.ns}.cache.${cacheName}`);
  }
}
