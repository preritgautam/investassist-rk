import 'reflect-metadata';

export const RequestDecoratorKey = Symbol('Request');
export type RequestDecorator =
  (key?: string) => (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;

export const request: RequestDecorator =
  (key?: string) => (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const existingOptions = Reflect.getOwnMetadata(RequestDecoratorKey, target, propertyKey) || [];
    existingOptions.push({
      parameterIndex,
      key,
    });
    Reflect.defineMetadata(RequestDecoratorKey, existingOptions, target, propertyKey);
  };
