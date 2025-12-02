import { LoggingLoggerOptions } from '../LoggingPlugin';
import * as winston from 'winston';
import * as Transport from 'winston-transport';
import { LoggingTransportLocator } from '../service/LoggingTransportLocator';

export class LoggerFactory {
  constructor(
    private readonly namespace: string,
    private readonly transportLocator: LoggingTransportLocator,
  ) {
  }

  async create(options: LoggingLoggerOptions) {
    let { transports: transportAliases, getFormat, ...rest } = options;
    if (typeof transportAliases === 'string') {
      transportAliases = [transportAliases];
    }

    const transports = await Promise.all(transportAliases.map((transportName): Promise<Transport> => {
      const transportAlias = `${this.namespace}.transport.${transportName}`;
      return this.transportLocator.resolve2(transportAlias);
    }));

    return winston.createLogger({
      ...rest,
      format: getFormat ? getFormat() : undefined,
      transports,
    });
  }
}
