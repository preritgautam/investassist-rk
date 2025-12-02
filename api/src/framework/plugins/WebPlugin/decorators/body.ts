import 'reflect-metadata';

export const BodyDecoratorKey = Symbol('Body');
export type TransformFunction = (any) => any;
export type BodyDecorator =
  (key?: string, transform?: TransformFunction) =>
    (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;

export const body: BodyDecorator =
  (key?: string, transform?: TransformFunction) =>
    (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
      const existingOptions = Reflect.getOwnMetadata(BodyDecoratorKey, target, propertyKey) || [];
      existingOptions.push({
        parameterIndex,
        key,
        transform,
      });
      Reflect.defineMetadata(BodyDecoratorKey, existingOptions, target, propertyKey);
    };
