import { FactoryName, FactoryOptions, FilteredServiceLocator } from '../../../core/container';
import { AbstractGlobalErrorHandler } from '../middlewares/AbstractGlobalErrorHandler';

export class GlobalErrorHandlerLocator extends FilteredServiceLocator {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filter(name: FactoryName, options: FactoryOptions): boolean {
    return this.isInstanceOf(name, AbstractGlobalErrorHandler);
  }
}
