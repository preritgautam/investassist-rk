import { AbstractPlugin } from './AbstractPlugin';
import { ServiceContainer } from '../container';
import deepmerge = require('deepmerge');

export class PluginLoader {
  private plugins: Map<string, AbstractPlugin> = new Map;

  loadPlugin(plugin: AbstractPlugin, { namespace = null }) {
    const ns = namespace || plugin.getDefaultNamespace();
    if (this.plugins.has(ns)) {
      throw new Error(`A plugin with name ${ns} is already added.`);
    }
    plugin._setNamespace(ns);
    this.plugins.set(ns, plugin);
  }

  boot(appConfig: {}, serviceContainer: ServiceContainer) {
    this.plugins.forEach((plugin, ns) => {
      const defaultConfig = plugin.getDefaultConfig();
      const config = appConfig[ns] || {};
      const mergedConfig: object = deepmerge(defaultConfig, config, {
        arrayMerge(target: any[], source: any[]): any[] {
          return source;
        },
      });
      plugin.config = mergedConfig;
      plugin.registerServices(serviceContainer, mergedConfig);
    });
  }

  async startPlugins(serviceContainer: ServiceContainer) {
    const promises = [];
    this.plugins.forEach((plugin: AbstractPlugin) => {
      promises.push(plugin.start(serviceContainer));
    });
    return Promise.all(promises);
  }
}
