import { FactoryName, FilteredServiceLocator } from '../../../core/container';
import { AbstractJobHandler } from '../AbstractJobHandler';

export class JobHandlerServiceLocator extends FilteredServiceLocator {
  filter(name: FactoryName): boolean {
    return typeof name === 'function' && name.prototype instanceof AbstractJobHandler;
  }
}
