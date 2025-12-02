import { BaseEvent } from './BaseEvent';
import { SpreadsheetWrapper } from '../SpreadSheets';

export class SelectionChangingEvent extends BaseEvent {
  handle(ss: SpreadsheetWrapper) {
    ss.spreadsheet.updateSelectionState();
  }
}
