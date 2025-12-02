import 'reflect-metadata';

export const NextDecoratorKey = Symbol('Next');
export type NextDecorator = () => (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;

export const next: NextDecorator = () => (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
  Reflect.defineMetadata(NextDecoratorKey, {
    parameterIndex,
  }, target, propertyKey);
};
