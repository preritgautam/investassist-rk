import { Deal } from '../../db/entity/Deal';
import { Document } from '../../db/entity/Document';
import { DocumentData } from '../../db/entity/DocumentData';
import { CFColumn, CFDataColumn, CFDataRow, CFExtractedData } from '../../types';
import { injectable } from '../../boot';
import { DateTime } from 'luxon';
import { DocumentStatus } from '../../models/enums/DocumentStatus';


interface FinancialDataRow {
  lineItem: string;
  head: string;
  category: string;
  t12Total?: number;
  ytdTotal?: number;
  calculatedT3?: number;
  calculatedT6?: number;
  calculatedT9?: number;
  calculatedT12?: number;
}

interface CFDocumentRowData {
  lineItem: string;
  head: string;
  category: string;
  rowKey: string;
}

interface PreProcessedCashFlowData {
  rowData: Record<string, CFDocumentRowData>;
  columnData: CFColumn[];
}

interface GetDataOptions {
  cashFlowIds?: string[];
}


@injectable()
export class DealFinancialDetailsService {
  async getData(deal: Deal, options?: GetDataOptions): Promise<FinancialDataRow[]> {
    const cashFlows = await deal.cashFlows as Document[];
    const validatedCashFlows = options?.cashFlowIds ?
      // validated check is skipped for this case assuming only validated docs list will be passed
      cashFlows.filter((cf: Document) => options.cashFlowIds.includes(cf.id)) :
      cashFlows.filter((cf) => cf.status === DocumentStatus.Validated);

    const [, dealPeriodEnd] = this.getDealPeriod(validatedCashFlows);

    const documentsData: DocumentData[] = await Promise.all(
      validatedCashFlows.map(async (cf: Document) => await cf.documentData),
    );
    const preProcessedDocData = documentsData.map(
      (docData, i) => this.preProcessCashFlowData(docData, validatedCashFlows[i]),
    );

    // Zip documents and data together
    const zippedCashFlowsAndData: [Document, PreProcessedCashFlowData][] =
      validatedCashFlows.map((cf, i) => [cf, preProcessedDocData[i]]);

    // Sort based on ending period
    zippedCashFlowsAndData.sort((item1, item2) => {
      const end1 = new Date((item1[0] as Document).periodTo);
      const end2 = new Date((item2[0] as Document).periodTo);
      return end1.getTime() - end2.getTime();
    });

    const financialData: Record<string, FinancialDataRow> = {};

    // add calculated document totals
    this.addCalculatedTotals(zippedCashFlowsAndData, dealPeriodEnd);

    // populate from earliest document to latest
    zippedCashFlowsAndData.forEach(([, ppDocData]) => {
      Reflect.ownKeys(ppDocData.rowData).forEach((rowKeyWithPosition: string) => {
        financialData[rowKeyWithPosition] = {
          ...(financialData[rowKeyWithPosition] ?? {}),
          ...ppDocData.rowData[rowKeyWithPosition],
        };
      });
    });

    Reflect.ownKeys(financialData).forEach((rowKeyWithPosition: string) => {
      const rowData = financialData[rowKeyWithPosition];
      Reflect.ownKeys(rowData).forEach((columnKey: string) => {
        const value = rowData[columnKey];
        if (typeof value === 'number') {
          rowData[columnKey] = Number(Number(value).toFixed(3));
        }
      });
    });

    // Clean up column names
    const cleanData: FinancialDataRow[] = [];
    const monthlyColumnNamesSet = new Set<string>();
    Reflect.ownKeys(financialData).forEach((rowKey: string) => {
      const row: FinancialDataRow = financialData[rowKey];
      const cleanRow: FinancialDataRow = {
        head: row.head, category: row.category, lineItem: row.lineItem,
      };

      Reflect.ownKeys(row).forEach((columnName: string) => {
        if (!['head', 'category', 'lineItem', 'rowKey'].includes(columnName)) {
          if (columnName.startsWith('calculated')) {
            cleanRow[columnName] = row[columnName];
          } else {
            const [, period, periodEndDate] = columnName.split('|');
            const periodEndDateTime = DateTime.fromISO(periodEndDate);
            if (row[columnName] === undefined) {
              row[columnName] = NaN;
            }
            // Add monthly data
            if (period === 'monthly') {
              const monthColumn = periodEndDate.substring(0, 7);
              cleanRow[monthColumn] = row[columnName];
              monthlyColumnNamesSet.add(monthColumn);
            } else if (period === 'ytd') {
              const periodStart = periodEndDateTime.startOf('year').toISODate();
              if (dealPeriodEnd.getTime() === new Date(periodEndDate).getTime()) {
                cleanRow[`ytdTotal ${periodStart} ${periodEndDate}`] = row[columnName];
              }
            } else if (period === 'ttm') {
              const periodStart = periodEndDateTime.minus({ year: 1, day: -1 }).toISODate();
              if (dealPeriodEnd.getTime() === new Date(periodEndDate).getTime()) {
                cleanRow[`t12Total ${periodStart} ${periodEndDate}`] = row[columnName];
              } else if (periodEndDate.substring(5, 7) === '12') {
                cleanRow[`historical ${periodStart} ${periodEndDate}`] = row[columnName];
              }
            } else if (period === 'yearly' || period === 'null') {
              const periodStart = periodEndDateTime.startOf('year').toISODate();
              if (dealPeriodEnd.getTime() === new Date(periodEndDate).getTime()) {
                cleanRow[`t12Total ${periodStart} ${periodEndDate}`] = row[columnName];
              } else {
                cleanRow[`historical ${periodStart} ${periodEndDate}`] = row[columnName];
              }
            }
          }
        }
      });

      cleanData.push(cleanRow);
    });


    const dataWithT3 = this.addTrailingData(cleanData ?? [], 3, monthlyColumnNamesSet, dealPeriodEnd);
    const dataWithT6 = this.addTrailingData(dataWithT3, 6, monthlyColumnNamesSet, dealPeriodEnd);
    const dataWithT9 = this.addTrailingData(dataWithT6, 9, monthlyColumnNamesSet, dealPeriodEnd);
    const dataWithT12 = this.addTrailingData(dataWithT9, 12, monthlyColumnNamesSet, dealPeriodEnd);

    return dataWithT12;
  }

  addTrailingData(
    rowData: FinancialDataRow[], monthCount: number, monthlyColumnNamesSet: Set<string>, dealPeriodEnd: Date,
  ): FinancialDataRow[] {
    if (!rowData.length) {
      return rowData;
    }

    const columnNamesToFind: string[] = [];

    let dateTime = DateTime.fromJSDate(dealPeriodEnd);
    for (let i = 0; i < monthCount; i++) {
      columnNamesToFind.push(dateTime.toISODate().substring(0, 7));
      dateTime = dateTime.minus({ months: 1 });
    }

    const allColumnsExist = columnNamesToFind.every((columnName) => monthlyColumnNamesSet.has(columnName));

    let updatedData = rowData;
    if (allColumnsExist) {
      updatedData = rowData.map((row) => {
        return {
          ...row,
          [`calculatedT${monthCount}`]: columnNamesToFind.reduce(
            (total, columnName) => total + parseInt(row[columnName]) ?? 0, 0,
          ),
        };
      });
    }

    return updatedData;
  }

  getDealPeriod(cashFlows: Document[]): [Date, Date] {
    let start = null;
    let end = null;
    cashFlows.forEach((cf: Document) => {
      const docStart = cf.periodFrom && new Date(cf.periodFrom);
      const docEnd = cf.periodTo && new Date(cf.periodTo);
      start = !!docStart && (start === null || start > docStart) ? docStart : start;
      end = !!docEnd && (end === null || end < docEnd) ? docEnd : end;
    });
    return [start, end];
  }


  preProcessCashFlowData(cfData: DocumentData, cf: Document): PreProcessedCashFlowData {
    const editedData = cfData.editedData as CFExtractedData;
    const usefulColumns = editedData.columns.filter((column: CFColumn) => {
      if (['lineItem', 'head', 'category'].includes(column.key)) {
        return true;
      }
      const dColumn = column as CFDataColumn;
      if (dColumn.discard) {
        return false;
      }
      if (['actual', 'actual-total'].includes(dColumn.type)) {
        return true;
      }
    });

    const rowKeyCounts: Record<string, number> = {};

    const rowData: Record<string, CFDocumentRowData> = {};

    editedData.rows.forEach((dataRow: CFDataRow) => {
      const rowKey = `${dataRow.head}|${dataRow.category}|${dataRow.lineItem}`;
      rowKeyCounts[rowKey] = (rowKeyCounts[rowKey] ?? 0) + 1;

      const rowKeyWithPosition = `${rowKey}|${rowKeyCounts[rowKey]}`;

      const row: CFDocumentRowData = {
        head: dataRow.head,
        category: dataRow.category,
        lineItem: dataRow.lineItem,
        rowKey: rowKeyWithPosition,
      };

      usefulColumns.forEach((column: CFColumn) => {
        if (false === ['lineItem', 'head', 'category'].includes(column.key)) {
          const dColumn = column as CFDataColumn;
          const columnKey =
            `${dColumn.type}|${dColumn.period}|${dColumn.periodEndDate}|${cf.periodFrom}|${cf.periodTo}`;
          row[columnKey] = dataRow[column.key];
        }
      });

      rowData[rowKeyWithPosition] = row;
    });

    return {
      rowData,
      columnData: usefulColumns,
    };
  }

  private addCalculatedTotals(
    zippedCashFlowsAndData: [Document, PreProcessedCashFlowData][], dealPeriodEnd: Date,
  ) {
    zippedCashFlowsAndData.forEach(([cf, ppData]) => {
      const monthlyColumns = ppData.columnData.filter(
        (col: CFDataColumn) => col.period === 'monthly',
      ) as CFDataColumn[];
      const columnDates = monthlyColumns.map((col: CFDataColumn) => col.periodEndDate).sort();
      let total = 0.0;
      let type = '';

      if (columnDates.length > 0) {
        if (columnDates.length === 12) {
          if (columnDates[0].substring(5, 7) !== '01') {
            type = 't12Total';
          } else {
            if (columnDates[0].substring(0, 4) === dealPeriodEnd.toISOString().substring(0, 4)) {
              type = 't12Total';
            } else {
              type = 'historical';
            }
          }
        } else if (columnDates.length < 12 && columnDates[0].substring(5, 7) === '01') {
          type = 'ytdTotal';
        }
      }

      if (type !== '') {
        const start = DateTime.fromISO(monthlyColumns[0].periodEndDate).startOf('month').toISODate();
        const end = monthlyColumns[monthlyColumns.length - 1].periodEndDate;
        Reflect.ownKeys(ppData.rowData).forEach((rowKey: string) => {
          total = monthlyColumns.reduce((total, column: CFDataColumn) => {
            const columnKey =
              `${column.type}|${column.period}|${column.periodEndDate}|${cf.periodFrom}|${cf.periodTo}`;

            let columnValue = Number(ppData.rowData[rowKey][columnKey]);
            if (isNaN(columnValue)) {
              columnValue = 0;
            }
            return total + columnValue;
          }, 0);
          ppData.rowData[rowKey][`calculated_${type} ${start} ${end}`] = total;
        });
      }
    });
  }
}
