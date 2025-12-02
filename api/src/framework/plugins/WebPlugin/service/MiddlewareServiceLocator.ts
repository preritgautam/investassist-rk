import { FactoryName, FactoryOptions, FilteredServiceLocator } from '../../../core/container';
import { AbstractMiddleware } from '../middlewares/AbstractMiddleware';

export class MiddlewareServiceLocator extends FilteredServiceLocator {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filter(name: FactoryName, options: FactoryOptions): boolean {
    return this.isInstanceOf(name, AbstractMiddleware);
  }
}

