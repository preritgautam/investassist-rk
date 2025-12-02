import { FactoryName, FactoryOptions, FilteredServiceLocator } from '../../../core/container';
import { AbstractTemplateEngine } from '../engines/ITemplateEngine';

export class TemplateEngineLocator extends FilteredServiceLocator {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filter(name: FactoryName, options: FactoryOptions): boolean {
    return (typeof name === 'function' && name.prototype instanceof AbstractTemplateEngine);
  }
}
