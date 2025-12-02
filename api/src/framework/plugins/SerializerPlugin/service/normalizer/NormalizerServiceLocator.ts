import { FactoryName, FactoryOptions, FilteredServiceLocator } from '../../../../core/container';
import { AbstractNormalizer } from './AbstractNormalizer';

export class NormalizerServiceLocator extends FilteredServiceLocator {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filter(name: FactoryName, options: FactoryOptions): boolean {
    return this.isInstanceOf(name, AbstractNormalizer);
  }
}
