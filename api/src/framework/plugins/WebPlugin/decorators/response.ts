import 'reflect-metadata';

export const ResponseDecoratorKey = Symbol('Response');
export type ResponseDecorator = () => (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;

export const response: ResponseDecorator =
  () => (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    Reflect.defineMetadata(ResponseDecoratorKey, {
      parameterIndex,
    }, target, propertyKey);
  };
