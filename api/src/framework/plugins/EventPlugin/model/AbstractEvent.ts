export abstract class AbstractEvent {
  static Type = '';

  static getType() {
    return this.Type || this.name;
  }

  public getType() {
    // @ts-ignore
    return this.constructor.Type || this.constructor.name;
  }
}
