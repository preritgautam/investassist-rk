import { BaseCommand } from './BaseCommand';
import { GCRange, SpreadsheetWrapper } from '../SpreadSheets';

export class TextFormatCommand extends BaseCommand {
  run(ss: SpreadsheetWrapper, options: any) {
    const { spreadsheet } = ss;
    const { activeSheetIndex, formatType } = options;
    const range = spreadsheet.getSelections(activeSheetIndex)[0];
    this.updateTextFormat(spreadsheet, range, formatType);
  }

  updateTextFormat(ss: SpreadsheetWrapper, range: GCRange, formatType: string) {
    const { spreadsheet } = ss;
    const { row, col, rowCount, colCount } = range;
    const style = new spreadsheet.GC.Spread.Sheets.Style();
    for (let r = row; r < row + rowCount; r++) {
      for (let c = col; c < col + colCount; c++) {
        if (formatType === 'underline') {
          this.setUnderlineText(spreadsheet, r, c);
        } else {
          const currentStyle = spreadsheet.getSheet().getStyle(r, c);
          if (!currentStyle) {
            style.font = `${formatType} 11pt Calibri`;
            spreadsheet.getSheet().setStyle(r, c, style);
          } else {
            const { font } = currentStyle;
            const cell = spreadsheet.getSheet().getCell(r, c);

            if (font === undefined) {
              cell.font(`${formatType} 11pt Calibri`);
            } else if (font.includes(formatType)) {
              cell.font(font.replace(formatType, ''));
            } else {
              cell.font(`${formatType} ${font}`);
            }
          }
        }
      }
    }
  }

  setUnderlineText(ss: SpreadsheetWrapper, row: number, col: number) {
    const { spreadsheet } = ss;
    const { textDecoration } = spreadsheet.getSheet().getStyle(row, col);
    const underlineType =
      textDecoration === undefined || textDecoration === 0 ?
        spreadsheet.GC.Spread.Sheets.TextDecorationType.underline :
        spreadsheet.GC.Spread.Sheets.TextDecorationType.none;
    spreadsheet.getSheet().getCell(row, col).textDecoration(underlineType);
  }
}

export const textFormatCommand = TextFormatCommand.get();

class ItalicTextFormatCommand extends TextFormatCommand {
  static instance = null;

  run(ss: SpreadsheetWrapper, options: any) {
    const { spreadsheet } = ss;
    options.activeSheetIndex = spreadsheet.getActiveSheetIndex();
    options.formatType = 'italic';
    options.cmd = 'setItalicTextCommand';
    return super.run(spreadsheet, options);
  }
}

class BoldTextFormatCommand extends TextFormatCommand {
  static instance = null;

  run(ss: SpreadsheetWrapper, options: any) {
    const { spreadsheet } = ss;
    options.activeSheetIndex = spreadsheet.getActiveSheetIndex();
    options.formatType = 'bold';
    options.cmd = 'setBoldTextCommand';
    return super.run(spreadsheet, options);
  }
}

class UnderlineTextFormatCommand extends TextFormatCommand {
  static instance = null;

  run(ss: SpreadsheetWrapper, options: any) {
    const { spreadsheet } = ss;
    options.activeSheetIndex = spreadsheet.getActiveSheetIndex();
    options.formatType = 'underline';
    options.cmd = 'setUnderlineTextCommand';
    return super.run(spreadsheet, options);
  }
}

export const italicTextFormatCommand = ItalicTextFormatCommand.get();
export const boldTextFormatCommand = BoldTextFormatCommand.get();
export const underlineTextFormatCommand = UnderlineTextFormatCommand.get();
