import { ServiceContainer } from '../container';

export abstract class AbstractPlugin {
  private _config: object;
  protected _namespace: string;

  _setNamespace(ns: string) {
    this._namespace = ns;
  }

  set config(config) {
    if (!this._config) {
      this._config = config;
    } else {
      throw new Error(`Plugin config can only be set once.`);
    }
  }

  get config() {
    return this._config;
  }

  abstract getDefaultNamespace();

  getDefaultConfig() {
    return {};
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  registerServices(serviceContainer: ServiceContainer, config: object): void {
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async start(serviceContainer: ServiceContainer) {
  }
}
