import 'reflect-metadata';

export const HeadersDecoratorKey = Symbol('Headers');
export type HeadersDecorator =
  (key?: string) => (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;

export const headers: HeadersDecorator =
  (key?: string) => (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const existingOptions = Reflect.getOwnMetadata(HeadersDecoratorKey, target, propertyKey) || [];
    existingOptions.push({
      parameterIndex,
      key,
    });
    Reflect.defineMetadata(HeadersDecoratorKey, existingOptions, target, propertyKey);
  };
