import { BaseCommand } from './BaseCommand';
import { SpreadsheetWrapper } from '../SpreadSheets';

class SetColorCommand extends BaseCommand {
  run(ss: SpreadsheetWrapper, options: any) {
    const { spreadsheet } = ss;
    const { selections, color, isForeColor, activeSheetIndex } = options;
    const sheet = spreadsheet.getSheet(activeSheetIndex);
    // TODO: check on this
    // @ts-ignore
    const isFiltered = sheet.rowFilter() == null ? null : Object.keys(sheet.rowFilter().LX);

    for (const { row, col, rowCount, colCount } of selections) {
      if (isFiltered !== null && isFiltered.length > 0) {
        for (let i = row; i < row + rowCount; i++) {
          if (i > -1 && sheet.getRowVisible(i)) {
            const cellRange = sheet.getRange(i, col, 1, colCount, spreadsheet.GC.Spread.Sheets.SheetArea.viewport);
            isForeColor ? cellRange.foreColor(color) : cellRange.backColor(color);
          }
        }
      } else {
        const cellRange = sheet.getRange(row, col, rowCount, colCount);
        isForeColor ? cellRange.foreColor(color) : cellRange.backColor(color);
      }
    }
  }
}

export const setColorCommand = SetColorCommand.get();
