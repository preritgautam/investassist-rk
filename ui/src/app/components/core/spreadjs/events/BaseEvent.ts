import { SpreadsheetWrapper } from '../SpreadSheets';

export class BaseEvent {
  static instance: BaseEvent = null;

  static get(): BaseEvent {
    if (!this.instance) {
      this.instance = new this();
    }
    return this.instance;
  }

  suspend(ss: SpreadsheetWrapper) {
    ss.spreadsheet.suspend();
  }

  resume(ss: SpreadsheetWrapper) {
    ss.spreadsheet.resume();
  }

  handleEvent(ss: SpreadsheetWrapper, ...args: any[]) {
    this.suspend(ss);
    this.handle(ss, ...args);
    this.resume(ss);
  }

  handle(ss: SpreadsheetWrapper, ...args: any[]) {
    throw new Error('Implement in derived event handler');
  }
}
