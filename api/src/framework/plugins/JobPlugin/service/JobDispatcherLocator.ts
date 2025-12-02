import { FactoryName, FactoryOptions, FilteredServiceLocator } from '../../../core/container';
import { AbstractJobDispatcher } from '../models/AbstractJobDispatcher';

export class JobDispatcherLocator extends FilteredServiceLocator {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filter(name: FactoryName, options: FactoryOptions): boolean {
    return typeof name === 'function' && name.prototype instanceof AbstractJobDispatcher;
  }
}
