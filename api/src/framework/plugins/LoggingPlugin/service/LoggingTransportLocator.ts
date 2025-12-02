import { TaggedServiceLocator } from '../../../core/container';

export class LoggingTransportLocator extends TaggedServiceLocator {
  constructor(namespace: string) {
    super(`${namespace}.transport`);
  }
}
