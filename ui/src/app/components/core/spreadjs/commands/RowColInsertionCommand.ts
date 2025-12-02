import { BaseCommand } from './BaseCommand';
import { SpreadsheetWrapper } from '../SpreadSheets';

export class RowColInsertionCommand extends BaseCommand {
  hasUndo = true;

  run(ss: SpreadsheetWrapper, options: any) {
    const { spreadsheet } = ss;
    const sheet = spreadsheet.getSheet();
    const range = options.ranges ? options.ranges[0] :
      options.selections ? options.selections[0] :
        sheet.getSelections().pop();
    options.ranges = [range];

    const { row, rowCount, col, colCount } = range;

    if (row < 1) {
      sheet.addColumns(col, colCount);
      spreadsheet.onRowColInsertion(false, sheet, row, col, rowCount, colCount);
      spreadsheet.bindSheetHeader(sheet);
      // NOTE: this doesn't really belong here, but without this undo won't work with shortcut key
      options.cmd = 'insertRowColumnCommand';
    } else if (col < 1) {
      sheet.addRows(row, rowCount);
      spreadsheet.onRowColInsertion(false, sheet, row, col, rowCount, colCount);
      // NOTE: this doesn't really belong here, but without this undo won't work with shortcut key
      options.cmd = 'insertRowColumnCommand';
    }
  }

  undo(spreadsheet, options) {
    const sheet = spreadsheet.getSheet();
    const range = options.ranges === undefined ? options.selections[0] : options.ranges[0];
    const {
      row, rowCount, col, colCount,
    } = range;
    spreadsheet.onRowColInsertion(true, sheet, row, col, rowCount, colCount);
    // NOTE: this doesn't really belong here, but without this undo won't work with shortcut key
    options.cmd = 'insertRowColumnCommand';
    return true;
  }
}

export const insertRowColumnCommand = RowColInsertionCommand.get();
