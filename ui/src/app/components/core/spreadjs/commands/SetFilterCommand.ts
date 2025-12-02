import { BaseCommand } from './BaseCommand';
import { SpreadsheetWrapper } from '../SpreadSheets';

class SetFilterCommand extends BaseCommand {
  run(ss: SpreadsheetWrapper, options: any) {
    const { spreadsheet } = ss;
    const { activeSheetIndex } = options;
    const sheet = spreadsheet.getSheet(activeSheetIndex);
    if (sheet.rowFilter()) {
      sheet.rowFilter(null);
    } else {
      const selections = spreadsheet.getSheet().getSelections();
      if (selections.length > 0) {
        const selection = selections[0];
        sheet.rowFilter(
          new spreadsheet.GC.Spread.Sheets.Filter.HideRowFilter(
            new spreadsheet.GC.Spread.Sheets.Range(0, selection.col, sheet.getRowCount(), selection.colCount),
          ),
        );
      }
    }
  }
}

export const setFilterCommand = SetFilterCommand.get();
