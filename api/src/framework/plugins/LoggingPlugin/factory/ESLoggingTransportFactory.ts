import { ElasticsearchTransport, ElasticsearchTransportOptions } from 'winston-elasticsearch';
import { AbstractLoggingTransportFactory } from './AbstractLoggingTransportFactory';

export class ESLoggingTransportFactory extends AbstractLoggingTransportFactory {
  create(options: ElasticsearchTransportOptions) {
    return new ElasticsearchTransport(options);
  }
}
