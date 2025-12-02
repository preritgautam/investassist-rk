import { LoggerFactory } from '../factory/LoggerFactory';
import { LoggingLoggerOptions } from '../LoggingPlugin';
import { Container } from '../../../core/container';

export class LoggersBuilder {
  constructor(
    private readonly namespace: string,
    private readonly container: Container,
    private readonly loggerFactory: LoggerFactory,
    private readonly loggersConfig: Record<string, LoggingLoggerOptions>,
  ) {
  }

  async buildLoggers() {
    return Promise.all(
      Reflect.ownKeys(this.loggersConfig).map(async (loggerName: string) => {
        const logger = await this.loggerFactory.create(this.loggersConfig[loggerName]);
        const alias = `${this.namespace}.logger.${loggerName}`;
        this.container.value(alias, {
          value: logger,
          alias,
          tags: [`${this.namespace}.logger`],
        });
      }),
    );
  }
}
