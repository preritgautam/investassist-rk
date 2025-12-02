import { CacheKey, hashKey } from '../utils/hashKey';

export interface _CacheSetOptions {
  key: string,
  value: any,
  ttl?: number
}

export interface CacheSetOptions extends Omit<_CacheSetOptions, 'key'> {
  key: CacheKey,
}

export interface CacheGetOptions extends Omit<_CacheGetOptions, 'key'> {
  key: CacheKey,
}

export interface _CacheGetOptions {
  key: string,
  getter?: Function,
  ttl?: number,
}

export abstract class AbstractCache {
  set(setOptions: CacheSetOptions): Promise<any> {
    if (typeof setOptions.key === 'string') {
      // TS doesn't understands that we have checked the type
      // @ts-ignore
      return this._set(setOptions);
    } else {
      return this._set({ ...setOptions, key: hashKey(setOptions.key) });
    }
  }

  get(getOptions: CacheGetOptions): Promise<any> {
    if (typeof getOptions.key === 'string') {
      // TS doesn't understands that we have checked the type
      // @ts-ignore
      return this._get(getOptions);
    } else {
      return this._get({ ...getOptions, key: hashKey(getOptions.key) });
    }
  }

  del(key: CacheKey): Promise<any> {
    if (typeof key === 'string') {
      return this._del(key);
    } else {
      return this._del(hashKey(key));
    }
  }

  abstract _set(setOptions: _CacheSetOptions): Promise<any> | any;

  abstract _get(getOptions: _CacheGetOptions): Promise<any> | any;

  abstract _del(key: string): Promise<any> | any;
}
