import { BaseCommand } from './BaseCommand';
import { SpreadsheetWrapper } from '../SpreadSheets';

export class FreezeCommand extends BaseCommand {
  hasUndo = true;

  run(ss: SpreadsheetWrapper, options: any) {
    const { spreadsheet } = ss;
    const { activeSheetIndex } = options;
    const sheet = spreadsheet.getSheet(activeSheetIndex);
    const { col, colCount, row, rowCount } = sheet.getSelections()[0];

    if (rowCount === 1 && colCount === 1) {
      spreadsheet.freezeRow(row);
      spreadsheet.freezeColumn(col);
    }
    if (col === -1) {
      spreadsheet.freezeRow(row);
    }
    if (row === -1) {
      spreadsheet.freezeColumn(col);
    }
  }

  undo(spreadsheet, options) {
    const { activeSheetIndex } = options;
    spreadsheet.resetColFreeze(activeSheetIndex);
    spreadsheet.resetRowFreeze(activeSheetIndex);
  };
}

export const freezeCommand = FreezeCommand.get();
