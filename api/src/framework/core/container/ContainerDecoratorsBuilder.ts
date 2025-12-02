import 'reflect-metadata';
import { Container, DecoratorFunction, FactoryName, ResolveFunction, Tags } from './Container';


export type GetDependenciesListFunction = (r: ResolveFunction, ra: ResolveFunction) => any[] | Promise<any[]>;
export type InjectableGetDependenciesFunction =
  (ResolveFunction) => { [key: number]: any } | Promise<{ [key: number]: any }>;

export type InjectableOptions = {
  tags?: Tags,
  decoratorFunction?: DecoratorFunction,
  getDependencies?: InjectableGetDependenciesFunction,
  dependsOn?: FactoryName[],
  getDependenciesList?: GetDependenciesListFunction
  alias?: string,
}

export class InjectValueGetter {
  constructor(public readonly valueGetter: Function) {
  }
}

export type InjectableDecorator =
  (name?: FactoryName | InjectableOptions, options?: InjectableOptions) => (ClassType) => void
export type InjectDecorator =
  (name: FactoryName | InjectValueGetter) =>
    (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;

export type ContainerDecorators = {
  injectable: InjectableDecorator,
  inject: InjectDecorator
}

export function isFactoryName(value: FactoryName | InjectableOptions) {
  return ['string', 'number', 'symbol', 'function'].includes(typeof value);
}

function toInteger(name, value: any): number {
  const i = parseInt(value);
  if (i.toString() === value) {
    return i;
  }

  // eslint-disable-next-line max-len
  throw new Error(`The getDependencies function provided as part of the injectable decorator on ${name.toString()} must return an object with integer indexes it used ${value}`);
}

export class ContainerDecoratorsBuilder {
  buildDecorators(container: Container): ContainerDecorators {
    return {
      inject: this.buildInjectDecorator(container.containerId),
      injectable: this.buildInjectableDecorator(container),
    };
  }

  private buildInjectDecorator(containerId: symbol | string): InjectDecorator {
    return function inject(type: FactoryName | InjectValueGetter) {
      return function decorator(target: Object, propertyKey: string | symbol, parameterIndex: number) {
        const existingInjections = Reflect.getOwnMetadata(containerId, target, propertyKey) || [];
        existingInjections.push({
          index: parameterIndex,
          type,
        });
        Reflect.defineMetadata(containerId, existingInjections, target, propertyKey);
      };
    };
  }

  private buildInjectableDecorator(container: Container): InjectableDecorator {
    const { containerId } = container;
    return (name?: FactoryName | InjectableOptions, options: InjectableOptions = {}) => {
      if (name !== undefined && !isFactoryName(name)) {
        options = <InjectableOptions>(name || {});
        name = undefined;
      }

      const { tags = [], decoratorFunction, getDependencies, alias, dependsOn, getDependenciesList } = options;

      const dependenciesGetter: InjectableGetDependenciesFunction = getDependencies || (() => ({}));
      const dependenciesListGetter: GetDependenciesListFunction =
        getDependenciesList || (async (resolve: ResolveFunction) => {
          return Promise.all(dependsOn.map((type) => {
            return resolve(type);
          }));
        });

      return (Klass) => {
        const typeToRegister = name === undefined ? Klass : name;

        container.factory(typeToRegister, {
          factoryFunction: async (resolve: ResolveFunction, resolveByAlias: ResolveFunction) => {
            let dependencies = [];

            if (dependsOn || getDependenciesList) {
              dependencies = await dependenciesListGetter(resolve, resolveByAlias);
            } else {
              const injections = Reflect.getOwnMetadata(containerId, Klass) || [];
              const providedDeps = await dependenciesGetter(resolve);

              for (const { type, index } of injections) {
                let dep;
                if (type instanceof InjectValueGetter) {
                  dep = await type.valueGetter(resolve);
                } else {
                  dep = await resolve(type);
                }

                if (providedDeps[index]) {
                  // eslint-disable-next-line max-len
                  throw new Error(`The dependency for ${typeToRegister.toString()} at index ${index} is already provided by the getDependencies function provided with the injectable decorator. It can not be injected in the constructor.`);
                }
                providedDeps[index] = dep;
              }

              for (const depIndex of Reflect.ownKeys(providedDeps)) {
                dependencies[toInteger(typeToRegister, depIndex)] = providedDeps[depIndex];
              }

              for (let i = 0; i < dependencies.length; i++) {
                if (dependencies[i] === undefined) {
                  // eslint-disable-next-line max-len
                  console.warn(`You have probably missed to provide a dependency at position ${i} for ${typeToRegister.toString()}`);
                }
              }
            }

            return new Klass(...dependencies);
          },
          tags,
          decoratorFunction,
          alias,
        });
      };
    };
  }
}
