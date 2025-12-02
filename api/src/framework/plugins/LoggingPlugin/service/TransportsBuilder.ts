import { LoggingTransportFactory } from '../factory/LoggingTransportFactory';
import { LoggingTransports } from '../LoggingPlugin';
import { Container } from '../../../core/container';

export class TransportsBuilder {
  constructor(
    private readonly namespace: string,
    private readonly container: Container,
    private readonly transportFactory: LoggingTransportFactory,
    private readonly transportsConfig: Record<string, LoggingTransports>,
  ) {
  }

  async buildTransports() {
    return Promise.all(Reflect.ownKeys(this.transportsConfig).map(async (transportName: string) => {
      const alias = `${this.namespace}.transport.${transportName}`;
      const config = this.transportsConfig[transportName];
      const transport = await this.transportFactory.create(config.factory, config.options);
      this.container.value(alias, {
        value: transport,
        alias,
        tags: [`${this.namespace}.transport`],
      });
    }));
  }
}
