export class Service {
  private static instance;

  /**
   * Hook to use a service
   * @return {*}
   */
  static useService() {
    return this.getService();
  }

  static getService(...args) {
    if (!this.instance) {
      this.instance = new this(...args);
    }
    return this.instance;
  }

  // noinspection JSUnusedLocalSymbols
  constructor(...rest) {
  }
}

