import 'reflect-metadata';
import { FactoryName } from '../../../core/container';

export const ServiceDecoratorKey = Symbol('Service');
export type ServiceDecorator = (key?: FactoryName) =>
  (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;

export const service: ServiceDecorator = (key?: FactoryName) =>
  (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const existingOptions = Reflect.getOwnMetadata(ServiceDecoratorKey, target, propertyKey) || [];
    existingOptions.push({
      parameterIndex,
      key,
    });
    Reflect.defineMetadata(ServiceDecoratorKey, existingOptions, target, propertyKey);
  };
