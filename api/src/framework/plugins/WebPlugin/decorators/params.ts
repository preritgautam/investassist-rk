import 'reflect-metadata';

export const ParamsDecoratorKey = Symbol('Params');
export type ParamsDecorator =
  (key?: string, checkAllParams?: boolean) =>
    (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;

export const params: ParamsDecorator =
  (key?: string, checkAllParams: boolean = true) =>
    (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
      const existingOptions = Reflect.getOwnMetadata(ParamsDecoratorKey, target, propertyKey) || [];
      existingOptions.push({
        parameterIndex,
        key,
        checkAllParams,
      });
      Reflect.defineMetadata(ParamsDecoratorKey, existingOptions, target, propertyKey);
    };
