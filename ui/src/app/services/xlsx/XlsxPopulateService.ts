import * as XlsxPopulate from 'xlsx-populate';
import { Service } from '../../../bootstrap/service/Service';
import {
  Deal, DealDocument, XlsxPopulateSheet,
} from '../../../types';
import {
  workbookGlobalConfig,
  columns,
} from '../../../constants';
import { isoMonthToShortDate } from '../utils/utils';

export interface SheetNames {
  [sheetName: string]: string;
}

export interface StyledRows {
  [idx: number]: {
    fontColor: string,
    borderColor: string,
    fillColor: string,
    bold: boolean,
  };
}

export interface SheetHeader {
  name: string;
  mergeColCount?: number;
}

export interface SheetsData {
  [sheetKey: string]: {
    [tableName: string]: {
      data: any[][];
      freezeCell: string | boolean;
      allowFilter: boolean;
      header: SheetHeader[],
      subHeader: string[],
      hasSummaryRow: boolean,
      applyDefaultStyling: boolean,
      subSubHeader?: string[],
      discardedColumnIndices?: number[],
      styledRows?: StyledRows,
    }
  };
}

export class XlsxPopulateService extends Service {
  private startRow: number;

  constructor() {
    super();
    this.startRow = 0;
  }

  resetStartRow() {
    this.startRow = 0;
  }


  async getXlsxWorkbook2(
    sheetNames: SheetNames,
    sheetsData: SheetsData,
  ) {
    this.resetStartRow();
    const wb: XlsxPopulate.Workbook = await XlsxPopulate.fromBlankAsync();
    this.addWorkbookSheet(wb, sheetNames);

    Reflect.ownKeys(sheetNames).forEach((sheetName: string) => {
      const wbSheetName = sheetNames[sheetName as string];
      const sheet = wb.sheet(wbSheetName);
      this.startRow = workbookGlobalConfig.TABLE_START_ROW_WITHOUT_HEADER;
      sheet.column('A').width(1);
      columns.forEach((column) => {
        sheet.column(column).width(20);
      });

      Reflect.ownKeys(sheetsData[sheetName]).forEach((tableName: string) => {
        const { header, subHeader, freezeCell, data, hasSummaryRow, applyDefaultStyling } =
          sheetsData[sheetName][tableName];
        this.addHeader(wb, sheet, header);
        this.addSubHeader(wb, sheet, subHeader);
        if (sheetsData[sheetName][tableName].subSubHeader) {
          this.addSubHeader(wb, sheet, sheetsData[sheetName][tableName].subSubHeader);
        }
        !!data.length &&
        this.bindDataTable(wb, sheet,
          !!subHeader.length ? subHeader : header.map((head) => head.name), data, hasSummaryRow, applyDefaultStyling);
        if (freezeCell && typeof freezeCell === 'string') {
          this.freezePane(sheet, freezeCell);
        }
        if (!!sheetsData[sheetName][tableName].discardedColumnIndices) {
          columns.forEach((column: string, index: number) => {
            if (sheetsData[sheetName][tableName].discardedColumnIndices.includes(index)) {
              sheet.column(column).hidden(true);
            }
          });
        }

        if (sheetsData[sheetName][tableName].styledRows) {
          Reflect.ownKeys(sheetsData[sheetName][tableName].styledRows).forEach((idx) => {
            let rowIdx = workbookGlobalConfig.TABLE_START_ROW_INDEX +
              (!!header.length ? 1 : 0) +
              (!!subHeader.length ? 1 : 0) + Number(idx);
            if (sheetsData[sheetName][tableName].subSubHeader) {
              rowIdx += 1;
            }
            for (let i = 2; i < header.length + 2; i++) {
              sheet.row(rowIdx).cell(i).style({
                horizontalAlignment: 'center',
                verticalAlignment: 'center',
                fill: {
                  type: 'solid',
                  color: sheetsData[sheetName][tableName].styledRows[idx].fillColor,
                },
                fontColor: sheetsData[sheetName][tableName].styledRows[idx].fontColor,
                borderColor: sheetsData[sheetName][tableName].styledRows[idx].borderColor,
                borderStyle: 'thin',
                bold: sheetsData[sheetName][tableName].styledRows[idx].bold,
              });
            }
          });
        }
      });
    });
    wb.deleteSheet('Sheet1'); // remove sheet added by default
    return wb;
  }

  async getXlsxWorkbook(
    deal: Deal,
    document: DealDocument,
    sheetNames: SheetNames,
    sheetsData: SheetsData,
  ): Promise<XlsxPopulate.Workbook> {
    this.resetStartRow();

    const wb: XlsxPopulate.Workbook = await XlsxPopulate.fromBlankAsync();
    this.addWorkbookSheet(wb, sheetNames);
    Reflect.ownKeys(sheetNames).forEach((sheetName: string) => {
      const wbSheetName = sheetNames[sheetName as string];
      const sheet = wb.sheet(wbSheetName);
      this.startRow = workbookGlobalConfig.TABLE_START_ROW_INDEX;
      sheet.column('A').width(1);
      columns.forEach((column) => {
        sheet.column(column).width(20);
      });
      wb.sheet(sheet.name()).cell('B1').value([
        ['Property Name : ', deal?.name],
        [`${document.documentType === 'RRF' ? 'Rent Roll As On' : 'Period'}: `,
          `${document.documentType === 'RRF' ? document?.asOnDate :
            `${isoMonthToShortDate(document?.periodFrom)} -${isoMonthToShortDate(document?.periodTo)} `} `],
      ]).style({ bold: true, fontColor: '155c97', borderColor: '000000' });
      Reflect.ownKeys(sheetsData[sheetName]).forEach((tableName: string) => {
        const { header, subHeader, freezeCell, data, hasSummaryRow, applyDefaultStyling } =
          sheetsData[sheetName][tableName];
        this.addHeader(wb, sheet, header);
        this.addSubHeader(wb, sheet, subHeader);
        if (sheetsData[sheetName][tableName].subSubHeader) {
          this.addSubHeader(wb, sheet, sheetsData[sheetName][tableName].subSubHeader);
        }
        !!data.length &&
        this.bindDataTable(wb, sheet,
          !!subHeader.length ? subHeader : header.map((head) => head.name), data, hasSummaryRow, applyDefaultStyling);
        if (freezeCell && typeof freezeCell === 'string') {
          this.freezePane(sheet, freezeCell);
        }
        if (!!sheetsData[sheetName][tableName].discardedColumnIndices) {
          columns.forEach((column: string, index: number) => {
            if (sheetsData[sheetName][tableName].discardedColumnIndices.includes(index)) {
              sheet.column(column).hidden(true);
            }
          });
        }
        sheet.freezePanes(1, workbookGlobalConfig.TABLE_START_ROW_INDEX + 2);
        if (sheetsData[sheetName][tableName].styledRows) {
          Reflect.ownKeys(sheetsData[sheetName][tableName].styledRows).forEach((idx) => {
            let rowIdx = workbookGlobalConfig.TABLE_START_ROW_INDEX +
              (!!header.length ? 1 : 0) +
              (!!subHeader.length ? 1 : 0) + Number(idx);
            if (sheetsData[sheetName][tableName].subSubHeader) {
              rowIdx += 1;
            }
            for (let i = 2; i < header.length + 2; i++) {
              sheet.row(rowIdx).cell(i).style({
                horizontalAlignment: 'center',
                verticalAlignment: 'center',
                fill: {
                  type: 'solid',
                  color: sheetsData[sheetName][tableName].styledRows[idx].fillColor,
                },
                fontColor: sheetsData[sheetName][tableName].styledRows[idx].fontColor,
                borderColor: sheetsData[sheetName][tableName].styledRows[idx].borderColor,
                borderStyle: 'thin',
                bold: sheetsData[sheetName][tableName].styledRows[idx].bold,
              });
            }
          });
        }
      });
    });
    wb.deleteSheet('Sheet1'); // remove sheet added by default
    return wb;
  }

  addWorkbookSheet(wb, wbSheetNames) {
    Reflect.ownKeys(wbSheetNames).forEach((sheetName) => {
      wb.addSheet(wbSheetNames[sheetName]);
    });
  }

  addHeader(wb: XlsxPopulate.Workbook, sheet: XlsxPopulateSheet, header: SheetHeader[]) {
    if (!!header.length) {
      const headerNames = header.map((h) => h.name);
      let startIdx = 0;
      header.forEach((h, idx) => {
        if (h.mergeColCount) {
          this.mergeCell(
            wb, sheet, this.startRow, columns[startIdx], columns[startIdx + h.mergeColCount - 1]);
          sheet.cell(
            `${columns[startIdx]}${this.startRow}`,
          ).value(headerNames[idx]);
          startIdx = startIdx + h.mergeColCount;
        } else {
          sheet.cell(
            `${columns[startIdx]}${this.startRow}`,
          ).value(headerNames[idx]);
          const range =
            wb.sheet(sheet.name()).range(
              `${columns[startIdx]}${this.startRow}:${columns[startIdx]}${this.startRow}`,
            );
          this.applyHeaderStyle(range);
          startIdx++;
        }
      });
      this.startRow++;
    }
  }

  addSubHeader(wb: XlsxPopulate.Workbook, sheet: XlsxPopulateSheet, subHeader: string[]) {
    if (!!subHeader.length) {
      const startColumn = columns[0];
      const endColumn = columns[subHeader.length - 1];
      const range = wb.sheet(sheet.name()).range(
        `${startColumn}${this.startRow}:${endColumn}${this.startRow}`,
      );
      sheet.cell(
        `${columns[0]}${this.startRow}`,
      ).value([subHeader]);
      this.applyHeaderStyle(range);
      this.applyFilter(sheet, range);
      this.startRow++;
    }
  }

  mergeCell(
    wb: XlsxPopulate.Workbook,
    sheet: XlsxPopulateSheet,
    row: number, startColumn: string,
    endColumn: string,
  ) {
    const range = wb.sheet(sheet.name()).range(
      `${startColumn}${row}:${endColumn}${row}`,
    );
    this.applyHeaderStyle(range);
    range.merged(true);
  }

  freezePane(sheet: XlsxPopulateSheet, cell: string) {
    sheet.freezePanes(cell);
  }

  applyFilter(sheet: XlsxPopulateSheet, range: XlsxPopulate.range) {
    sheet.autoFilter(range);
  }

  bindDataTable(
    wb: XlsxPopulate.Workbook, sheet: XlsxPopulateSheet, subHeader: string[], data: any[][], hasSummaryRow: boolean,
    applyDefaultStyling: boolean,
  ) {
    sheet.cell(
      `${columns[0]}${this.startRow}`,
    ).value(data);
    data.forEach((_, rowIndex) => {
      const range = wb.sheet(sheet.name()).range(
        `${columns[0]}${this.startRow + rowIndex}:${columns[subHeader.length - 1]}${this.startRow + rowIndex}`
        ,
      );
      applyDefaultStyling && this.applyCellStyle(range, rowIndex, hasSummaryRow ? data.length - 1 : null);
    });


    this.startRow = this.startRow + data.length + 1;
  }

  applyHeaderStyle(range: XlsxPopulate.range) {
    range.style({
      horizontalAlignment: 'center',
      verticalAlignment: 'center',
      fill: {
        type: 'solid',
        color: '155c97',
      },
      fontColor: 'ffffff',
      borderColor: 'ffffff',
      borderStyle: 'thin',
    });
  }

  applyCellStyle(range: XlsxPopulate.range, rowIndex: number, summaryRowIndex: number) {
    const isEven = rowIndex % 2 === 0;
    range.style({
      horizontalAlignment: 'center',
      verticalAlignment: 'center',
      fill: {
        type: 'solid',
        color: rowIndex === summaryRowIndex ? '808080' : isEven ? 'ffffff' : 'dddddd',
      },
      fontColor: '000000',
      borderColor: '000000',
      borderStyle: 'thin',
    });
  }
}

export const useXlsxPopulateService: () =>
  XlsxPopulateService = () => XlsxPopulateService.useService();
