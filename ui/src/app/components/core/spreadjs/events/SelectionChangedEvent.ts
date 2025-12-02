import { BaseEvent } from './BaseEvent';
import { SpreadsheetWrapper } from '../SpreadSheets';

export class SelectionChangedEvent extends BaseEvent {
  handle(ss: SpreadsheetWrapper) {
    ss.spreadsheet.pasteFormat();
  }
}
