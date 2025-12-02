import { FactoryName, FactoryOptions, FilteredServiceLocator } from '../../../core/container';
import { AbstractLoggingTransportFactory } from '../factory/AbstractLoggingTransportFactory';

export class LoggingTransportFactoryLocator extends FilteredServiceLocator {
  filter(name: FactoryName, options: FactoryOptions): boolean {
    const isFactory = this.isInstanceOf(name, AbstractLoggingTransportFactory);

    if (!isFactory) {
      return false;
    }

    if (options.alias) {
      return true;
    }

    throw new Error(`The service ${name.toString()} must have an alias to be accessible from config`);
  }
}
