import { BaseCommand } from './BaseCommand';
import { SpreadsheetWrapper } from '../SpreadSheets';

class FillDataCommand extends BaseCommand {
  hasUndo = true;

  run(ss: SpreadsheetWrapper, options: any) {
    const { spreadsheet } = ss;
    const activeSheetIndex: number = spreadsheet.getActiveSheetIndex();
    const activeSheet = spreadsheet.getSheet();

    const selections = activeSheet.getSelections();
    if (selections.length > 0) {
      const { rowCount, row, col, colCount } = selections[0];

      const cellValue = spreadsheet.getCellValue(activeSheetIndex, row, col);
      const cellStyle = spreadsheet.getCellStyle(activeSheetIndex, row, col);

      options.selection = { rowCount, row, col, colCount };
      options.activeSheetIndex = activeSheetIndex;
      options.previousCellValues = spreadsheet.getColumnValues(activeSheetIndex, row, rowCount, col);
      options.previousCellStyles = spreadsheet.getColumnStyles(activeSheetIndex, row, rowCount, col);
      // NOTE: this doesn't really belong here, but without this undo won't work with shortcut key
      options.cmd = 'fillDataCommand';

      for (let i = 0; i < rowCount; i++) {
        spreadsheet.setCellValue(activeSheetIndex, row + i, col, cellValue);
        spreadsheet.setCellStyle(activeSheetIndex, row + i, col, cellStyle);
      }
    }
  }

  undo(spreadsheet, options) {
    const {
      activeSheetIndex, previousCellValues, previousCellStyles, selection: { row, rowCount, col },
    } = options;

    for (let i = 0; i < rowCount; i++) {
      spreadsheet.setCellValue(activeSheetIndex, row + i, col, previousCellValues[i]);
      spreadsheet.setCellStyle(activeSheetIndex, row + i, col, previousCellStyles[i]);
    }
  }
}

export const fillDataCommand = FillDataCommand.get();
