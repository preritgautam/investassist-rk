import { BaseCommand } from './BaseCommand';
import { SpreadsheetWrapper } from '../SpreadSheets';

class PasteFormatCommand extends BaseCommand {
  run(ss: SpreadsheetWrapper, options) {
    const { spreadsheet } = ss;
    const { copiedFormat, activeSheetIndex, selections } = options;

    for (const selection of selections) {
      const { row, rowCount, col, colCount } = spreadsheet.getCellRangeFromSelection(undefined, selection);
      for (let r = row; r < row + rowCount; r++) {
        for (let c = col; c < col + colCount; c++) {
          spreadsheet.setCellStyle(activeSheetIndex, r, c, copiedFormat.clone());
        }
      }
    }
  }
}

export const pasteFormatCommand = PasteFormatCommand.get();
