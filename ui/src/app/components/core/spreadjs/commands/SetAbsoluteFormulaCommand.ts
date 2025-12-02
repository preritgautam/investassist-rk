import { BaseCommand } from './BaseCommand';
import { SpreadsheetWrapper } from '../SpreadSheets';

export class SetAbsoluteFormulaCommand extends BaseCommand {
  run(ss: SpreadsheetWrapper, options: any) {
    const { spreadsheet } = ss;
    if (!spreadsheet.isActiveSheetProtected) {
      const sheet = spreadsheet.getSheet();
      if (sheet) {
        const selections = sheet.getSelections();
        if (selections.length > 0) {
          const { row, col } = selections[0];
          spreadsheet.absoluteFormulaReference(sheet, row, col);
        }
      }
    }
  }
}

export const setAbsoluteFormulaCommand = SetAbsoluteFormulaCommand.get();
