import { Container } from '../../../core/container';
import { CacheResolver } from '../service/CacheResolver';
import { AbstractCache } from '../engines/AbstractCache';
import { CacheKey } from '../utils/hashKey';

export interface CacheableOptions {
  cache?: string,
  ttl?: number,
  getKey?: (...args: any[]) => CacheKey | Promise<CacheKey>,
}

export type Cacheable = {
  container: Container,
} & ((o: CacheableOptions) => (t: any, k: string, d: PropertyDescriptor) => PropertyDescriptor)

async function getCache(container: Container, name: string) {
  const resolver: CacheResolver = await container.resolve(CacheResolver);
  return resolver.getCache(name);
}

export const cacheable: Cacheable = ({ cache = 'default', ttl, getKey }: CacheableOptions = {}) => {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args: any[]) {
      const _cache: AbstractCache = await getCache(cacheable.container, cache);

      // If a getKey function is defined, call it to get the key
      // else use args list by default along with the class and method name
      const className = target instanceof Function ? `${target.name}__static` : target.constructor.name;
      let key;
      if (getKey) {
        key = await getKey(...args);
        if (!Array.isArray(key)) {
          key = [className, propertyKey, key];
        } else {
          key = [className, propertyKey, ...key];
        }
      } else {
        key = [className, propertyKey, ...args];
      }

      return _cache.get({
        key, ttl, getter: () => originalMethod.call(this, ...args),
      });
    };

    return descriptor;
  };
};

cacheable.container = null;
