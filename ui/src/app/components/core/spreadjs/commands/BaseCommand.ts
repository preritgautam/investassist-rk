import { SpreadsheetWrapper } from '../SpreadSheets';

export class BaseCommand {
  static instance: BaseCommand = null;

  static get(): BaseCommand {
    if (!this.instance) {
      this.instance = new this();
    }

    return this.instance;
  }

  hasUndo: boolean = false;

  suspend(spreadsheet: SpreadsheetWrapper) {
    spreadsheet.spreadsheet.suspend();
  }

  resume(spreadsheet: SpreadsheetWrapper) {
    spreadsheet.spreadsheet.resume();
  }

  runCommand = (spreadsheet: SpreadsheetWrapper, options: any) => {
    this.suspend(spreadsheet);
    this.run(spreadsheet, options);
    this.resume(spreadsheet);
  };

  undoCommand = (spreadsheet: SpreadsheetWrapper, options: any) => {
    this.suspend(spreadsheet);
    this.undo(spreadsheet, options);
    this.resume(spreadsheet);
  };

  run(spreadsheet: SpreadsheetWrapper, options: any) {
    throw new Error('Implement this method in derived class');
  }

  undo(spreadsheet: SpreadsheetWrapper, options: any) {
    console.warn('Undo not implemented for this command');
  }
}
