import { LoggingTransportFactoryLocator } from '../service/LoggingTransportFactoryLocator';
import { AbstractLoggingTransportFactory } from './AbstractLoggingTransportFactory';
import { LoggingTransportOptions } from '../LoggingPlugin';

export class LoggingTransportFactory {
  constructor(private readonly locator: LoggingTransportFactoryLocator) {
  }

  async create(factoryAlias, options: LoggingTransportOptions) {
    const factory: AbstractLoggingTransportFactory = await this.locator.resolveByAlias(factoryAlias);
    return factory.create(options);
  }
}
