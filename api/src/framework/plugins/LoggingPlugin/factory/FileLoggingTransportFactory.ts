import * as winston from 'winston';

import { FileTransportOptions } from 'winston/lib/winston/transports';
import { AbstractLoggingTransportFactory } from './AbstractLoggingTransportFactory';

export class FileLoggingTransportFactory extends AbstractLoggingTransportFactory {
  create(options: FileTransportOptions) {
    return new winston.transports.File(options);
  }
}
