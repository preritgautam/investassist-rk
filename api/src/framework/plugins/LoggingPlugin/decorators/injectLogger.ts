import 'reflect-metadata';
import { InjectDecorator, InjectValueGetter, ResolveFunction } from '../../../core/container';
import * as winston from 'winston';

type HasInject = {
  inject: InjectDecorator,
}

type HasNamespace = {
  _namespace: string,
}

export type LoggerDecorator = HasInject & HasNamespace &
  ((alias: string, childParams?: object) =>
    (target: Object, propertyKey: string | symbol, parameterIndex: number) => void);

export const injectLogger: LoggerDecorator = (alias, childParams = {}) => {
  return function decorator(target: Object, propertyKey: string | symbol, parameterIndex: number) {
    if (!injectLogger.inject) {
      throw new Error('Trying to register a logger even before plugins are loaded?');
    }
    const ns = injectLogger._namespace;
    injectLogger.inject(
      new InjectValueGetter(async function(resolve: ResolveFunction) {
        const logger: winston.Logger = await resolve(`${ns}.logger.${alias}`);
        return logger.child({
          class: target['name'],
          ...childParams,
        });
      }),
    )(target, propertyKey, parameterIndex);
  };
};

injectLogger.inject = null;
injectLogger._namespace = '';
