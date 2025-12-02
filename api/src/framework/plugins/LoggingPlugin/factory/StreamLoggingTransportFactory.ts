import * as winston from 'winston';
import { StreamTransportOptions } from 'winston/lib/winston/transports';
import { AbstractLoggingTransportFactory } from './AbstractLoggingTransportFactory';

export class StreamLoggingTransportFactory extends AbstractLoggingTransportFactory {
  create(options: StreamTransportOptions) {
    return new winston.transports.Stream(options);
  }
}
