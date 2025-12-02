import { BaseCommand } from './BaseCommand';
import { GCRange, SpreadsheetWrapper } from '../SpreadSheets';

export class SetHorizontalAlignmentCommand extends BaseCommand {
  run(ss: SpreadsheetWrapper, options: any) {
    const { spreadsheet } = ss;
    const { activeSheetIndex, alignment } = options;
    for (const selection of (spreadsheet.getSelections(activeSheetIndex) as GCRange[])) {
      const range = spreadsheet.getCellRangeFromSelection(undefined, selection);
      range.hAlign(spreadsheet.GC.Spread.Sheets.HorizontalAlign[alignment]);
    }
  };
}

export const setHorizontalAlignmentCommand = SetHorizontalAlignmentCommand.get();
