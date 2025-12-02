import { BaseCommand } from './BaseCommand';
import { SpreadsheetWrapper } from '../SpreadSheets';

class SelectRowCommand extends BaseCommand {
  run(spreadsheet: SpreadsheetWrapper, options: any) {
    const sheet = spreadsheet.spreadsheet.getSheet();
    sheet.setSelection(sheet.getActiveRowIndex(), 0, 1, sheet.getColumnCount());
  }
}

export const selectRowCommand = SelectRowCommand.get();
