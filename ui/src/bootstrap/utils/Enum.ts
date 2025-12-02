export type EnumOrKey = Enum | string;

export abstract class Enum {
  public readonly key: string;
  public readonly label: string;
  private static enums = {};

  static all() {
    return Reflect.ownKeys(this.enums).map((k) => this.enums[k]);
  }

  static allMap() {
    return Reflect.ownKeys(this.enums).reduce((map, key) => {
      map[key] = this.enums[key].label;
      return map;
    }, {});
  }

  static getMap(enums: Enum[]) {
    return enums.reduce((map, e: Enum) => {
      map[e.key] = e.label;
      return map;
    }, {});
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

  private static add(e: Enum) {
    if (!this.hasOwnProperty('enums')) {
      this.enums = {};
    }
    this.enums[e.key] = e;
  }

  constructor(key: string, label?: string) {
    this.key = key;
    this.label = label || key;
    Enum.add.call(this.constructor, this);
  }

  toString() {
    return this.key;
  }
}

export type EnumType = {
  new(key: string, label?: string): Enum;
  allMap: () => Record<string, string>;
  all: () => Enum[];
};
