import 'reflect-metadata';

export const QueryDecoratorKey = Symbol('Query');
export type QueryTransformFunction = (any) => any;

export type QueryDecorator =
  (key?: string, transform?: QueryTransformFunction, defaultValue?: any) =>
    (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;

export const query: QueryDecorator =
  (key?: string, transform?: QueryTransformFunction, defaultValue?: any) =>
    (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
      const existingOptions = Reflect.getOwnMetadata(QueryDecoratorKey, target, propertyKey) || [];
      existingOptions.push({
        parameterIndex,
        key,
        transform,
        defaultValue,
      });
      Reflect.defineMetadata(QueryDecoratorKey, existingOptions, target, propertyKey);
    };
