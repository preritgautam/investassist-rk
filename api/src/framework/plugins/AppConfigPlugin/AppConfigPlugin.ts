import { AbstractPlugin } from '../../core/plugins/AbstractPlugin';
import { ServiceContainer } from '../../core/container';
import { config as configDecorator } from './decorators/config';

export class AppConfigPlugin extends AbstractPlugin {
  getDefaultNamespace() {
    return 'app';
  }

  registerServices(serviceContainer: ServiceContainer, appConfig: object) {
    configDecorator.inject = serviceContainer.decorators.inject;
    configDecorator.appConfig = appConfig;
  }
}

export { config } from './decorators/config';
