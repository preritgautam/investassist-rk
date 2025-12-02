import * as winston from 'winston';
import { HttpTransportOptions } from 'winston/lib/winston/transports';
import { AbstractLoggingTransportFactory } from './AbstractLoggingTransportFactory';

export class HttpLoggingTransportFactory extends AbstractLoggingTransportFactory {
  create(options: HttpTransportOptions) {
    return new winston.transports.Http(options);
  }
}
