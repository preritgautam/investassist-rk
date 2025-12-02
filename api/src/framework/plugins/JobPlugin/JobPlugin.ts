import { AbstractPlugin } from '../../core/plugins/AbstractPlugin';
import { ServiceContainer } from '../../core/container';
import { BullJobDispatcher } from './engines/bull/BullJobDispatcher';
import { BullJobQueue } from './engines/bull/BullJobQueue';
import { BullJobHandler } from './engines/bull/BullJobHandler';
import { JobHandlerServiceLocator } from './service/JobHandlerServiceLocator';
import { BullJobWorker } from './engines/bull/BullJobWorker';
import { BullJobRunnerCommand } from './command/BullJobRunnerCommand';
import { MemoryJobHandler } from './engines/memory/MemoryJobHandler';
import { MemoryJobDispatcher } from './engines/memory/MemoryJobDispatcher';
import { JobsService } from './JobsService';
import { JobDispatcherLocator } from './service/JobDispatcherLocator';
import { RedisOptions } from 'ioredis';

export type JobPluginOptions = {
  defaultEngine: string,
  bull: {
    commandName: string | ((ns: string) => string),
    redis: RedisOptions,
    queue: {
      name: string,
    }
  },
  memory: {},
  handlers: Record<string, string[]>,
}

export class JobPlugin extends AbstractPlugin {
  getDefaultNamespace() {
    return 'jobs';
  }

  getDefaultConfig(): JobPluginOptions {
    return {
      defaultEngine: 'jobs.engine.memory',
      memory: {},
      bull: {
        commandName: (ns) => `${ns}:bull:runner`,
        redis: {
          host: 'localhost',
          port: 6379,
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
        },
        queue: {
          name: 'defaultQueue',
        },
      },
      handlers: {},
    };
  }

  registerServices(serviceContainer: ServiceContainer, config: JobPluginOptions) {
    const { decorators: { injectable } } = serviceContainer;

    injectable()(JobHandlerServiceLocator);
    injectable()(JobDispatcherLocator);

    // Bull stuff
    injectable({
      getDependenciesList: async (resolve) => [await resolve(BullJobQueue)],
      alias: 'jobs.engine.bull',
    })(BullJobDispatcher);

    injectable({
      getDependenciesList: async (resolve) => [
        await resolve(JobHandlerServiceLocator),
        config,
      ],
    })(BullJobHandler);


    injectable({
      getDependenciesList: () => [config],
    })(BullJobQueue);

    injectable({
      getDependenciesList: async (resolve) => [
        await resolve(BullJobHandler),
        config,
      ],
    })(BullJobWorker);

    let commandName = '';
    if (config.bull.commandName) {
      if (typeof config.bull.commandName === 'string') {
        commandName = config.bull.commandName;
      } else if (typeof config.bull.commandName === 'function') {
        commandName = config.bull.commandName(this._namespace);
      }
    }

    BullJobRunnerCommand.Command = commandName;
    injectable({
      getDependenciesList: async (resolve) => [
        await resolve(BullJobWorker),
      ],
    })(BullJobRunnerCommand);

    // memory stuff
    injectable({
      getDependenciesList: async (resolve) => [
        await resolve(JobHandlerServiceLocator),
        config,
      ],
    })(MemoryJobHandler);

    injectable({
      dependsOn: [MemoryJobHandler],
      alias: 'jobs.engine.memory',
    })(MemoryJobDispatcher);

    injectable({
      getDependenciesList: async (reolve) => [
        await reolve(JobDispatcherLocator),
        config.defaultEngine,
      ],
    })(JobsService);
  }
}
