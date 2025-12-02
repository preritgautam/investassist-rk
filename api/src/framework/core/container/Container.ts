import { ServiceLocator } from './ServiceLocator';

export type Type<A> = { new(...args: any[]): A };
export type ClassType = Type<any>;

export type Tags = Array<string>;
export type FactoryName = PropertyKey | ClassType | Function;

export type ResolveFunction = (name: FactoryName) => Promise<any>;
export type ResolveMultipleFunction = (names: Array<FactoryName>) => Promise<Array<any>>;
export type FactoryFunction = (resolve?: ResolveFunction, resolveByAlias?: ResolveFunction) => any | Promise<any>;
export type DecoratorFunction = (service: any, resolve?: ResolveFunction) => void | Promise<void>;
export type FilterFactoryFunction = (name: FactoryName, options: FactoryOptions) => boolean;

export type FactoryOptions = {
  factoryFunction: FactoryFunction,
  decoratorFunction?: DecoratorFunction,
  tags?: Tags,
  alias?: string,
}

export type ValueOptions = {
  value: any,
  tags?: Tags,
  alias?: string,
}

export type RegisterFactoryFunction = (name: FactoryName, options?: FactoryOptions) => void;
export type RegisterValueFunction = (name: FactoryName, options?: ValueOptions) => void;

// export type AutoTagHook = (name: FactoryName, options: FactoryOptions) => string[] | void;
export class Container {
  private factories = new Map;
  private values = new Map;
  private aliasValues: Map<string, any> = new Map;
  containerId = Symbol('Container');

  private globalPausePromise = Promise.resolve();

  private buildingPromises = new Map;

  pauseFor(promise) {
    this.globalPausePromise = this.globalPausePromise.then(() => promise);
  }

  // private autoTagHooks = new Map;

  // addAutoTagHook(registerHook: AutoTagHook) {
  //   this.autoTagHooks._set(registerHook, registerHook);
  //   return () => this.autoTagHooks.delete(registerHook);
  // }

  factory: RegisterFactoryFunction = (name: FactoryName, options: FactoryOptions) => {
    this.register(name, options);
  };

  value: RegisterValueFunction = (name: FactoryName, options: ValueOptions) => {
    const { value, ...rest } = options;
    const factoryOptions: FactoryOptions = {
      factoryFunction: () => value,
      ...rest,
    };
    this.register(name, factoryOptions);
  };

  resolve: ResolveFunction = async (name: FactoryName) => {
    await this.globalPausePromise;
    const factoryOptions = this.resolveFactory(name);

    if (!this.values.has(name)) {
      await this.buildValue(name, factoryOptions);
    }
    return this.values.get(name);
  };

  resolveMultiple: ResolveMultipleFunction = async (names: Array<FactoryName>) => {
    await this.globalPausePromise;
    const promises: Array<Promise<any>> = names.map((name: FactoryName) => this.resolve(name));
    return Promise.all(promises);
  };

  resolveByAlias: ResolveFunction = async (alias: string) => {
    await this.globalPausePromise;
    const [name, factoryOptions]: [FactoryName, FactoryOptions] = this.resolveFactoryByAlias(alias);

    if (!this.aliasValues.has(alias)) {
      await this.buildValue(name, factoryOptions);
    }
    return this.values.get(name);
  };

  resolve2: ResolveFunction = async (nameOrAlias: FactoryName) => {
    try {
      return await this.resolve(nameOrAlias);
    } catch {
    }

    try {
      return await this.resolveByAlias(nameOrAlias);
    } catch {
      throw new Error(`No factory found with name or alias: ${nameOrAlias.toString()}`);
    }
  };

  getTaggedFactories(tag: string): FactoryName[] {
    const matched = [];
    this.factories.forEach((factory, type) => {
      if (factory.tags && factory.tags.has(tag)) {
        matched.push(type);
      }
    });
    return matched;
  }

  filterFactories(filter: FilterFactoryFunction): FactoryName[] {
    return Array.from(this.factories.entries())
      .filter(([name, options]) => filter(name, options))
      .map(([name]) => name);
  }

  private register(name: FactoryName, options: FactoryOptions): void {
    if (this.factories.has(name)) {
      throw new Error(`A factory with name ${name.toString()} is already registered`);
    }

    // for (const hook of this.autoTagHooks.values()) {
    //   const tags = hook(name, { ...options }) || [];
    //   options.tags = [...(options.tags || []), ...tags];
    // }

    this.factories.set(name, {
      ...options,
      tags: new Set(options.tags || []),
    });
  };

  private resolveFactory(name: FactoryName): FactoryOptions {
    if (!this.factories.has(name)) {
      let factoryName = name.toString();
      if (name instanceof Function) {
        factoryName = `[Function: ${name.name}]`;
      }

      throw new Error(`Unknown service/value with name ${factoryName} requested`);
    }

    return this.factories.get(name);
  };

  private resolveFactoryByAlias(alias: string): [FactoryName, FactoryOptions] {
    // const factoryNames = this.factories.keys();
    // for (const name of factoryNames) {
    //   const factoryOptions = this.factories.get(name);
    //   if (factoryOptions.alias === alias) {
    //     return [name, factoryOptions];
    //   }
    // }
    for (const [name, factoryOptions] of this.factories) {
      if (factoryOptions.alias === alias) {
        return [name, factoryOptions];
      }
    }
    throw new Error(`Unknown service/value with alias ${alias} requested`);
  };

  private async buildValue(name: FactoryName, factoryOptions: FactoryOptions) {
    if (this.buildingPromises.has(name)) {
      // already building the requested value
      return this.buildingPromises.get(name);
    }

    this.buildingPromises.set(name, new Promise(async (resolve, reject) => {
      try {
        const value = await factoryOptions.factoryFunction(this.resolve, this.resolveByAlias);
        if (value instanceof ServiceLocator) {
          value.container = this;
        }

        this.values.set(name, value);

        const { alias } = factoryOptions;
        if (alias) {
          if (this.aliasValues.has(alias)) {
            reject(new Error(`There is already a factory registered with alias: ${alias}`));
          }

          this.aliasValues.set(alias, value);
        }

        if (factoryOptions.decoratorFunction) {
          await factoryOptions.decoratorFunction(value, this.resolve);
        }
        resolve(null);
      } catch (e) {
        reject(e);
      }
    }));

    return this.buildingPromises.get(name);
  }
}
