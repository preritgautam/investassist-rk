import { BaseCommand } from './BaseCommand';
import { SpreadsheetWrapper } from '../SpreadSheets';

export class RowColDeletionCommand extends BaseCommand {
  hasUndo = true;

  run(ss: SpreadsheetWrapper, options) {
    const { spreadsheet } = ss;
    const sheet = spreadsheet.getSheet();
    if (sheet.options.isProtected) {
      return;
    }

    const range = options.ranges ? options.ranges[0] :
      options.selections ? options.selections[0] :
        sheet.getSelections().pop();
    options.ranges = [range];

    const { row, rowCount, col, colCount } = range;

    if (row < 1) {
      sheet.deleteColumns(col, colCount);
      spreadsheet.onRowColDeletion(false, sheet, row, col, rowCount, colCount);
      spreadsheet.bindSheetHeader(sheet);
      // NOTE: this doesn't really belong here, but without this undo won't work with shortcut key
      options.cmd = 'deleteRowColumnCommand';
    } else if (col < 1) {
      spreadsheet.onRowColDeletion(false, sheet, row, col, rowCount, colCount);
      sheet.deleteRows(row, rowCount);
      // NOTE: this doesn't really belong here, but without this undo won't work with shortcut key
      options.cmd = 'deleteRowColumnCommand';
    }
  }

  undo(spreadsheet, options) {
    const sheet = spreadsheet.getSheet();
    const range = options.ranges === undefined ? options.selections[0] : options.ranges[0];
    const {
      row, rowCount, col, colCount,
    } = range;
    spreadsheet.onRowColDeletion(true, sheet, row, col, rowCount, colCount);
    // NOTE: this doesn't really belong here, but without this undo won't work with shortcut key
    options.cmd = 'deleteRowColumnCommand';
    return true;
  }
}

export const deleteRowColumnCommand = RowColDeletionCommand.get();
