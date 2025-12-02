import { BaseCommand } from './BaseCommand';
import { SpreadsheetWrapper } from '../SpreadSheets';

class SelectColumnCommand extends BaseCommand {
  run(spreadsheet: SpreadsheetWrapper, options: any) {
    const sheet = spreadsheet.spreadsheet.getSheet();
    sheet.setSelection(0, sheet.getActiveColumnIndex(), sheet.getRowCount(), 1);
  }
}

export const selectColumnCommand = SelectColumnCommand.get();
