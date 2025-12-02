import { AbstractPlugin } from '../../core/plugins/AbstractPlugin';


import {
  ConsoleTransportOptions,
  FileTransportOptions,
  HttpTransportOptions,
  StreamTransportOptions,
} from 'winston/lib/winston/transports';
import { ElasticsearchTransportOptions } from 'winston-elasticsearch';
import * as winston from 'winston';
import * as logform from 'logform';
import { ServiceContainer } from '../../core/container';
import { ConsoleLoggingTransportFactory } from './factory/ConsoleLoggingTransportFactory';
import { FileLoggingTransportFactory } from './factory/FileLoggingTransportFactory';
import { ESLoggingTransportFactory } from './factory/ESLoggingTransportFactory';
import { HttpLoggingTransportFactory } from './factory/HttpLoggingTransportFactory';
import { StreamLoggingTransportFactory } from './factory/StreamLoggingTransportFactory';
import { LoggingTransportFactoryLocator } from './service/LoggingTransportFactoryLocator';
import { LoggingTransportFactory } from './factory/LoggingTransportFactory';
import { TransportsBuilder } from './service/TransportsBuilder';
import { LoggerFactory } from './factory/LoggerFactory';
import { LoggingTransportLocator } from './service/LoggingTransportLocator';
import { LoggersBuilder } from './service/LoggersBuilder';
import { injectLogger } from './decorators/injectLogger';

export type ConsoleLoggingTransportOptions = ConsoleTransportOptions
export type FileLoggingTransportOptions = FileTransportOptions
export type HttpLoggingTransportOptions = HttpTransportOptions
export type StreamLoggingTransportOptions = StreamTransportOptions
export type ESLoggingTransportOptions = ElasticsearchTransportOptions


export type LoggingTransportOptions =
  FileLoggingTransportOptions
  | ConsoleLoggingTransportOptions
  | HttpLoggingTransportOptions
  | StreamLoggingTransportOptions
  | ESLoggingTransportOptions

export type LoggingTransports = {
  factory: string,
  options: LoggingTransportOptions
}

export type LoggingLoggerOptions = Omit<winston.LoggerOptions, 'transports' | 'format'> & {
  transports: string | string[],
  getFormat: () => logform.Format,
};

export type LoggingPluginOptions = {
  transports: Record<string, LoggingTransports>,
  loggers: Record<string, LoggingLoggerOptions>
}

export class LoggingPlugin extends AbstractPlugin {
  getDefaultNamespace() {
    return 'logging';
  }

  getDefaultConfig(): LoggingPluginOptions {
    return {
      transports: {
        file: {
          factory: `${this._namespace}.transport.factory.file`,
          options: {
            filename: 'logs.log',
            dirname: 'logs',
          },
        },
        console: {
          factory: `${this._namespace}.transport.factory.console`,
          options: {},
        },
      },
      loggers: {
        default: {
          level: 'debug',
          getFormat: () => winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
          transports: ['file', 'console'],
        },
      },
    };
  }


  registerServices(serviceContainer: ServiceContainer, config: LoggingPluginOptions) {
    const { decorators: { injectable, inject }, container } = serviceContainer;
    const ns = this._namespace;
    injectLogger.inject = inject;
    injectLogger._namespace = ns;

    injectable({ alias: `${ns}.transport.factory.console` })(ConsoleLoggingTransportFactory);
    injectable({ alias: `${ns}.transport.factory.file` })(FileLoggingTransportFactory);
    injectable({ alias: `${ns}.transport.factory.elastic` })(ESLoggingTransportFactory);
    injectable({ alias: `${ns}.transport.factory.http` })(HttpLoggingTransportFactory);
    injectable({ alias: `${ns}.transport.factory.stream` })(StreamLoggingTransportFactory);

    injectable()(LoggingTransportFactoryLocator);

    injectable({
      dependsOn: [LoggingTransportFactoryLocator],
    })(LoggingTransportFactory);

    injectable({
      getDependenciesList: async (resolve) => [
        ns,
        container,
        await resolve(LoggingTransportFactory),
        config.transports,
      ],
    })(TransportsBuilder);

    injectable({
      getDependenciesList: () => [ns],
    })(LoggingTransportLocator);

    injectable({
      getDependenciesList: async (resolve) => [
        ns,
        await resolve(LoggingTransportLocator),
      ],
    })(LoggerFactory);

    injectable({
      getDependenciesList: async (resolve) => [
        ns,
        container,
        await resolve(LoggerFactory),
        config.loggers,
      ],
    })(LoggersBuilder);
  }


  async start(serviceContainer: ServiceContainer): Promise<any> {
    const transportsBuilder: TransportsBuilder = await serviceContainer.container.resolve(TransportsBuilder);
    const loggersBuilder: LoggersBuilder = await serviceContainer.container.resolve(LoggersBuilder);

    await transportsBuilder.buildTransports();
    await loggersBuilder.buildLoggers();
  }
}
