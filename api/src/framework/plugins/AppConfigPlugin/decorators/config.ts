import 'reflect-metadata';
import { InjectDecorator, InjectValueGetter } from '../../../core/container';
import * as objectPath from 'object-path';

type HasInject = {
  inject: InjectDecorator,
}

type HasAppConfig = {
  appConfig: any,
}

export type ConfigDecorator =
  HasInject &
  HasAppConfig &
  ((configKey: string) => (target: Object, propertyKey: string | symbol, parameterIndex: number) => void);

export const config: ConfigDecorator = (configKey) => {
  return function decorator(target: Object, propertyKey: string | symbol, parameterIndex: number) {
    if (!config.inject || !config.appConfig) {
      throw new Error('Trying to register a config even before plugins are loaded?');
    }

    config.inject(
      new InjectValueGetter(function() {
        if (!objectPath.has(config.appConfig, configKey)) {
          throw new Error(`Unknown app config requested: ${configKey}`);
        }
        return objectPath.get(config.appConfig, configKey);
      }),
    )(target, propertyKey, parameterIndex);
  };
};

config.inject = null;
config.appConfig = null;
