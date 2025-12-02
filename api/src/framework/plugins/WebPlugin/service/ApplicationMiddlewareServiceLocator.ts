import { FactoryName, FactoryOptions, FilteredServiceLocator } from '../../../core/container';
import { AbstractApplicationMiddleware } from '../middlewares/AbstractApplicationMiddleware';

export class ApplicationMiddlewareServiceLocator extends FilteredServiceLocator {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filter(name: FactoryName, options: FactoryOptions): boolean {
    return this.isInstanceOf(name, AbstractApplicationMiddleware);
  }
}
