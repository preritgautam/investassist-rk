import 'reflect-metadata';
import { InjectValueGetter, ResolveFunction, ServiceContainer } from '../../../core/container';

export type StorageDecorator =
  (storageKey?: string) => (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;

let _storage: StorageDecorator;

export const storage: StorageDecorator = (storageKey?: string) => _storage(storageKey);

export function storageDecoratorFactory(serviceContainer: ServiceContainer, ns: string, inject) {
  _storage = (storageKey?: string) => (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    inject(
      new InjectValueGetter(function(resolve: ResolveFunction) {
        return resolve(`${ns}.storage.${storageKey}`);
      }),
    )(target, propertyKey, parameterIndex);
  };
}
