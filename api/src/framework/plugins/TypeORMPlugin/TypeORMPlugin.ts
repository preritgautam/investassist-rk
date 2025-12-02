import { AbstractPlugin } from '../../core/plugins/AbstractPlugin';
import { ServiceContainer } from '../../core/container';
import { TypeORMService } from './TypeORMService';

export class TypeORMPlugin extends AbstractPlugin {
  getDefaultNamespace() {
    return 'typeorm';
  }

  getDefaultConfig(): {} {
    return {
      connections: [{
        name: 'default',
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'test',
        password: 'test',
        database: 'test',
        synchronize: false,
        logging: false,
        entities: ['src/app/db/entity'],
        migrations: ['src/app/db/migration'],
        subscribers: ['src/app/db/subscriber'],
        cli: {
          entitiesDir: 'src/app/db/entity',
          migrationsDir: 'src/app/db/migration',
          subscribersDir: 'src/app/db/subscriber',
        },
      }],
    };
  }

  registerServices(serviceContainer: ServiceContainer, config: object) {
    // super.registerServices(serviceContainer, config);
    serviceContainer.decorators.injectable({
      getDependenciesList: () => [config],
    })(TypeORMService);
  }


  async start(serviceContainer: ServiceContainer): Promise<any> {
    const typeORMService: TypeORMService = await serviceContainer.container.resolve(TypeORMService);
    return typeORMService.createConnections();
  }
}
