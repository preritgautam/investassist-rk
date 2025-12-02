import { BaseCommand } from './BaseCommand';
import { SpreadsheetWrapper } from '../SpreadSheets';

export class SortCommand extends BaseCommand {
  run(ss: SpreadsheetWrapper, options: any) {
    const { spreadsheet } = ss;
    const { ascending, activeSheetIndex } = options;
    const sheet = spreadsheet.getSheet(activeSheetIndex);
    const selections = sheet.getSelections();
    if (selections.length > 0) {
      const { col } = selections[0];
      sheet.sortRange(1, 0, sheet.getRowCount() - 1, sheet.getColumnCount(), true, [{
        index: col,
        ascending,
      }]);
    }
  }
}

export const sortCommand = SortCommand.get();
