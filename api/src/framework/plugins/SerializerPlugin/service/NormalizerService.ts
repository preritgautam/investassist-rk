import { isSerializable } from '../decorators/serializable';
import { exposedOptionsKey } from '../key';
import { ExposeOptions } from '../decorators/expose';
import { NormalizerServiceLocator } from './normalizer/NormalizerServiceLocator';
import { AbstractNormalizer } from './normalizer/AbstractNormalizer';


export type Group = string;
export type Groups = Group[];

export interface NormalizeOptions {
  groups?: Groups,
  onlyMentionedGroups?: boolean,
  childOptions?: Record<PropertyKey, NormalizeOptions>
}

export class NormalizerService {
  constructor(private readonly normalizerServiceLocator: NormalizerServiceLocator) {
  }

  public async normalize(
    value: any | any[],
    options: NormalizeOptions = {},
    exposeOptions?: ExposeOptions,
  ): Promise<any> {
    if (Array.isArray(value)) {
      // normalize each element with the same options
      return {
        type: 'array',
        normalized: await Promise.all(value.map((v) => this.normalize(v, options, exposeOptions))),
        original: value,
      };
    } else if (value === null || value === undefined) {
      return {
        type: 'value',
        normalized: value,
        original: value,
      };
    } else if (typeof value === 'object') {
      // could be serializable or not
      if (isSerializable(value)) {
        // process as serializable
        return await this.normalizeSerializable(value, options);
      } else {
        // an object, has custom normalizer e.g. DateTime i.e. third party class not marked with Serializable
        // has normalizer option specified while being exposed
        if (exposeOptions && exposeOptions.normalizer) {
          return this.customNormalization(value, options, exposeOptions.normalizer);
        } else {
          const customNormalizer: AbstractNormalizer = await this.hasCustomNormalizer(value);
          if (customNormalizer) {
            // normalize with the custom normalizer
            return {
              type: 'custom',
              original: value,
              normalized: await customNormalizer.normalize(value, options),
            };
          } else {
            // simple object iterate on keys and use same passed groups to normalize each key
            const ret = {
              type: 'object',
              normalized: {},
              original: value,
            };
            for (const key of Reflect.ownKeys(value)) {
              ret.normalized[key] = await this.normalize(await value[key], options.childOptions?.[key]);
            }
            return ret;
          }
        }
      }
    } else {
      // not an array, not an object, most likely a scalar value, return as is
      return {
        type: 'value',
        normalized: value,
        original: value,
      };
    }
  }

  private async normalizeSerializable(value: any, options: NormalizeOptions) {
    const result = {
      type: 'serializable',
      normalized: {},
      original: value,
    };

    const toNormalize = [];
    const childrenExposeOptions = {};

    // Collect all keys
    let keys = Reflect.ownKeys(value);
    let obj = value;
    while (obj.__proto__) {
      keys = [...keys, ...Reflect.ownKeys(obj.__proto__)];
      obj = obj.__proto__;
    }

    // collect keys that should always be normalized
    if (!options.onlyMentionedGroups) {
      for (const key of keys) {
        if (typeof key === 'number') {
          continue;
        }
        const metadata = Reflect.getMetadata(exposedOptionsKey, value, key);
        childrenExposeOptions[key] = metadata;
        if (metadata) {
          const { groups } = metadata;
          if (groups.length === 0) {
            toNormalize.push(key);
          }
        }
      }
    }

    // for each group
    for (const group of options.groups ?? []) {
      // pick all keys with the group
      for (const key of keys) {
        if (typeof key === 'number') {
          continue;
        }
        const metadata = Reflect.getMetadata(exposedOptionsKey, value, key);
        if (metadata) {
          const { groups } = metadata;
          if (groups.includes(group)) {
            toNormalize.push(key);
          }
        }
      }
    }

    for (const key of toNormalize) {
      const childValue = await value[key];
      result.normalized[key] = await this.normalize(childValue, options.childOptions?.[key]);
    }

    return result;
  }

  private async customNormalization(value: any, options: NormalizeOptions, normalizerAlias: string) {
    const normalizer: AbstractNormalizer = await this.normalizerServiceLocator.resolveByAlias(normalizerAlias);
    return {
      type: 'custom',
      normalized: await normalizer.normalize(value, options),
      original: value,
    };
  }

  private async hasCustomNormalizer(value: object): Promise<AbstractNormalizer> {
    const normalizers = this.normalizerServiceLocator.getSupportedServices();
    for (let i = 0; i < normalizers.length; i++) {
      const n = <typeof AbstractNormalizer>normalizers[i];
      if (n.supports && n.supports(value)) {
        return this.normalizerServiceLocator.resolve2(n);
      }
    }
    return null;
  }
}
