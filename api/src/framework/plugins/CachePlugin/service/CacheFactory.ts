import { CacheOptions } from '../CachePlugin';
import { MemoryCache } from '../engines/MemoryCache';

export class CacheFactory {
  buildCache(options: CacheOptions) {
    switch (options.type) {
      case 'memory': {
        return new MemoryCache(options.options);
      }
    }
  }
}
