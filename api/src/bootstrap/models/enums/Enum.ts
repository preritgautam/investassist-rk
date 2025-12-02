import { expose } from '../../../framework/plugins/SerializerPlugin';

export type EnumOrKey<KeyType = string> = Enum | KeyType;

export abstract class Enum<KeyType extends string = string> {
  @expose() public readonly key: KeyType;

  @expose({ groups: ['withLabel'] }) public readonly label: string;
  static enums = {};

  static all() {
    return Reflect.ownKeys(this.enums).map((k) => this.enums[k]);
  }

  static getTransformer() {
    return {
      to: (_enum: Enum) => _enum.key,
      from: (key) => this.get(key),
    };
  }

  static getListTransformer() {
    return {
      to: (_enum: Enum[]) => _enum.map((e) => e.key),
      from: (keys) => keys && keys.map((key) => this.get(key)),
    };
  }

  static get(key: EnumOrKey) {
    if (this === Enum) {
      throw new Error('You need to call `get` on the appropriate Enum class');
    }

    if (key instanceof Enum) {
      return key;
    }
    return this.enums[key];
  }

  static add(e: Enum) {
    if (!this.hasOwnProperty('enums')) {
      this.enums = {};
    }
    this.enums[e.key] = e;
  }

  constructor(key: KeyType, label?: string) {
    this.key = key;
    this.label = label || key;
    Enum.add.call(this.constructor, this);
  }

  toString() {
    return this.key;
  }
}
