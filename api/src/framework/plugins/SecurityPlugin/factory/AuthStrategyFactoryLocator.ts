import { FactoryName, FilteredServiceLocator } from '../../../core/container';
import { AbstractAuthStrategyFactory } from './AbstractAuthStrategyFactory';

export class AuthStrategyFactoryLocator extends FilteredServiceLocator {
  filter(name: FactoryName): boolean {
    return typeof name === 'function' && name.prototype instanceof AbstractAuthStrategyFactory;
  }
}
