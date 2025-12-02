import { AbstractCache, _CacheGetOptions, _CacheSetOptions } from './AbstractCache';
import * as NodeCache from 'node-cache';

export interface MemoryCacheOptions extends NodeCache.Options {
}

export class MemoryCache extends AbstractCache {
  private cache: NodeCache;

  constructor(private readonly options: MemoryCacheOptions) {
    super();
    this.cache = new NodeCache(options);
  }

  async _set(setOptions: _CacheSetOptions): Promise<any> {
    this.cache.set(setOptions.key, setOptions.value, setOptions.ttl);
  }

  async _get(getOptions: _CacheGetOptions): Promise<any> {
    const value = this.cache.get(getOptions.key);
    if (value) {
      return Promise.resolve(value);
    }

    if (getOptions.getter) {
      const value = await getOptions.getter();
      await this._set({ key: getOptions.key, value, ttl: getOptions.ttl });
      return value;
    }

    return undefined;
  }

  async _del(key: string): Promise<any> {
    this.cache.del(key);
  }
}
