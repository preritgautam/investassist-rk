import { PluginLoader } from '../plugins/PluginLoader';
import { AbstractPlugin } from '../plugins/AbstractPlugin';
import {
  ContainerBuilder,
  ContainerDecorators,
  RegisterFactoryFunction,
  RegisterValueFunction,
  ServiceContainer,
} from '../container';
import { Autoloader } from '../autoloader/Autoloader';
import * as colors from 'colors/safe';

export interface Container extends ContainerDecorators {
  factory: RegisterFactoryFunction,
  value: RegisterValueFunction
}

export type KernelOptions = {
  debug: boolean,
  env: string,
  autoloadDirs: string[],
  config: object,
  silent: boolean,
}

export type AddPluginOptions = {
  namespace?: string,
  envs?: string[]
}

export class Kernel {
  private pluginLoader = new PluginLoader();
  private serviceContainer: ServiceContainer = new ContainerBuilder().buildContainer();
  private autoloader = new Autoloader();
  private startingPromise = null;

  constructor(
    private readonly options: KernelOptions,
  ) {
  }

  addPlugin(plugin: AbstractPlugin, options: AddPluginOptions = {}) {
    if (options.envs === undefined || options.envs.includes(this.options.env)) {
      this.pluginLoader.loadPlugin(plugin, { namespace: options.namespace });
      this.serviceContainer.container.value(plugin.constructor, {
        value: plugin,
      });
    }
  }

  boot(appConfig) {
    this.pluginLoader.boot(appConfig, this.serviceContainer);
    const promise = this.autoloadFiles();
    this.serviceContainer.container.pauseFor(promise);
  }

  getContainer(): ServiceContainer {
    return this.serviceContainer;
  }

  async start(): Promise<any> {
    if (!this.startingPromise) {
      this.startingPromise = this.pluginLoader.startPlugins(this.serviceContainer);
    }
    return this.startingPromise;
  }

  private async autoloadFiles() {
    if (!this.options.silent) {
      console.log(colors.blue('Registering services..\n'));
    }
    for (const dir of this.options.autoloadDirs) {
      await this.autoloader.load(dir);
    }
  }
}
