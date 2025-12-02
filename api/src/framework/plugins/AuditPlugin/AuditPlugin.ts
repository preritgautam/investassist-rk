import { AbstractPlugin } from '../../core/plugins/AbstractPlugin';
import { ServiceContainer } from '../../core/container';
import { AuditLogEventsListener } from './event/AuditLogEventsListener';

export interface AuditPluginOptions {
  auditLogService: string,
}

export class AuditPlugin extends AbstractPlugin {
  getDefaultNamespace() {
    return 'audit';
  }

  registerServices(serviceContainer: ServiceContainer, config: AuditPluginOptions) {
    const { decorators: { injectable } } = serviceContainer;

    injectable({
      getDependenciesList: async (resolve, resolveByAlias) => [
        await resolveByAlias(config.auditLogService),
      ],
    })(AuditLogEventsListener);
  }
}
