import { BaseCommand } from './BaseCommand';
import { SpreadsheetWrapper } from '../SpreadSheets';

class SetFormatCommand extends BaseCommand {
  run(ss: SpreadsheetWrapper, options: any) {
    const { spreadsheet } = ss;
    const { activeSheetIndex, format, alignment } = options;
    const sheet = spreadsheet.getSheet(activeSheetIndex);
    const selections = sheet.getSelections();

    selections.forEach((selection) => {
      const range = sheet.getRange(selection.row, selection.col, selection.rowCount, selection.colCount);
      range.formatter(format).hAlign(alignment);
    });
  }
}

export const setFormatCommand = SetFormatCommand.get();
