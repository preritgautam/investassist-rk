import * as winston from 'winston';
import { ConsoleTransportOptions } from 'winston/lib/winston/transports';
import { AbstractLoggingTransportFactory } from './AbstractLoggingTransportFactory';

export class ConsoleLoggingTransportFactory extends AbstractLoggingTransportFactory {
  create(options: ConsoleTransportOptions) {
    return new winston.transports.Console(options);
  }
}
