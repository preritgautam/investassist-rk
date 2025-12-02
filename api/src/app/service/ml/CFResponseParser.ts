import { injectable } from '../../boot';
import { ExtractDocumentParams } from './MLExtractionService';
import { DateTime } from 'luxon';
import {
  CFColumn,
  CFDataColumn,
  CFDataRow,
  CFMLColumn,
  CFMLLineItemRow,
  CFMLPageResult,
  CFMLResponse,
  CFStaticColumn,
} from '../../types';

export interface ParsedCFResponse {
  extracted: {
    rows: CFDataRow[];
    columns: CFColumn[];
  };
}

@injectable()
export class CFResponseParser {
  public parseResponse(extractionRequest: ExtractDocumentParams, mlResponse: CFMLResponse): ParsedCFResponse {
    const columns: CFColumn[] = CFResponseParser.getStaticColumns();
    const staticColumnCount = columns.length;
    const rows: CFDataRow[] = [];

    for (const pageResult of mlResponse.result) {
      this.addPageResult(pageResult, columns, rows, mlResponse.period_to, staticColumnCount);
    }

    this.fixNOIClassification(rows);
    this.fixTotalColumn(columns as CFDataColumn[]);

    return {
      extracted: {
        rows, columns,
      },
    };
  }

  private static getStaticColumns(): CFStaticColumn[] {
    return [
      {
        isStatic: true,
        key: 'lineItem',
        label: 'Line Item',
      },
      {
        isStatic: true,
        key: 'head',
        label: 'Head',
      },
      {
        isStatic: true,
        key: 'category',
        label: 'Category',
      },
    ];
  }

  private static cfMlColumnToCfColumn(mlCfColumn: CFMLColumn, periodEnd: Date) {
    let { type, period, month, year, quarter } = mlCfColumn;
    if (month) {
      month -= 1;
    }
    const cfColumn: CFColumn = {
      type: type,
      period: period,
      periodEndDate: null,
      key: '',
      discard: !['actual', 'actual-total'].includes(type),
    };

    if (mlCfColumn.is_line_item) {
      return {
        ...cfColumn,
        key: 'lineItem',
      };
    }

    if (cfColumn.type === null) {
      cfColumn.type = 'actual';
    }

    if (!['actual', 'actual-total'].includes(cfColumn.type)) {
      cfColumn.type = 'others';
    }

    // period says a total value
    if (cfColumn.period === 'yearly' || cfColumn.period === 'ytd' || cfColumn.period === 'ttm') {
      // ensure type to be a total type
      if (!cfColumn.type.endsWith('total')) {
        cfColumn.type = cfColumn.type === 'actual' ? 'actual-total' : cfColumn.type;
      }
    } else if (cfColumn.period === null) {
      if (cfColumn.type.endsWith('total')) {
        cfColumn.period = 'yearly';
      } else {
        cfColumn.period = 'monthly';
      }
    }

    const endDate = periodEnd ?? new Date();
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth();
    let periodEndDate: Date;

    if (cfColumn.period === 'yearly') {
      periodEndDate = new Date(year ?? endYear, 11);
    } else if (cfColumn.period === 'ytd') {
      periodEndDate = new Date(year ?? endYear, month ?? endMonth);
    } else if (cfColumn.period === 'ttm') {
      periodEndDate = new Date(year ?? endYear, month ?? endMonth);
    } else if (cfColumn.period === 'quarterly') {
      periodEndDate = new Date(year ?? endYear, quarter ? quarter * 3 - 1 : 2);
    } else {
      periodEndDate = new Date(year ?? endYear, month ?? endMonth);
    }

    cfColumn.periodEndDate = DateTime.fromJSDate(periodEndDate).endOf('month').toISO().substring(0, 10);
    return cfColumn;
  }

  cfColumnKey(column: CFColumn) {
    if (column.key !== '' && !column.key.startsWith('col')) {
      return '';
    }

    const dataColumn: CFDataColumn = column as CFDataColumn;
    return `${dataColumn.type}-${dataColumn.period}-${dataColumn.periodEndDate}`;
  }

  // Note: existingColumns will be updated
  private mapPageColumnsWithExistingColumns(
    existingColumns: CFColumn[], pageColumns: CFMLColumn[], periodEnd: Date, staticColumnCount: number,
  ): Record<number, number> {
    const columnUsed = existingColumns.map(() => false);
    const mapping = {};
    const existingColumnsKeys = existingColumns.map((c) => this.cfColumnKey(c));

    pageColumns.forEach((mlCfColumn, newColumnIndex) => {
      if (mlCfColumn.is_line_item_code) {
        // do nothing
      } else if (!mlCfColumn.is_line_item) {
        // Ignore line item column for mapping
        const newCFColumn = CFResponseParser.cfMlColumnToCfColumn(mlCfColumn, periodEnd);
        const newCFColumnKey = this.cfColumnKey(newCFColumn);

        for (let existingColumnIndex = 0; existingColumnIndex < existingColumnsKeys.length; existingColumnIndex++) {
          const existingColumnKey = existingColumnsKeys[existingColumnIndex];
          // if column key matches and column is not yet used
          if (newCFColumnKey === existingColumnKey && columnUsed[existingColumnIndex] === false) {
            columnUsed[existingColumnIndex] = true;
            mapping[newColumnIndex] = existingColumnIndex;
            break;
          }
        }

        if (mapping[newColumnIndex] === undefined) {
          existingColumns.push({
            ...newCFColumn,
            key: `col${existingColumns.length - staticColumnCount}`,
          });
          existingColumnsKeys.push(newCFColumnKey);
          mapping[newColumnIndex] = existingColumns.length - 1;
          columnUsed.push(true);
        }
      } else {
        mapping[newColumnIndex] = existingColumns.findIndex((column) => column.key === 'lineItem');
      }
    });

    return mapping;
  }

  // Note: existingColumns, dataRows, source will be updated
  private addPageResult(
    pageResult: CFMLPageResult, existingColumns: CFColumn[],
    dataRows: CFDataRow[], periodEnd: string,
    staticColumnCount: number,
  ) {
    const columnMapping = this.mapPageColumnsWithExistingColumns(
      existingColumns, pageResult.columns, new Date(periodEnd), staticColumnCount,
    );
    pageResult.line_items.forEach((row: CFMLLineItemRow) => {
      const dataRow: CFDataRow = {
        id: row.id,
        pageNumber: pageResult.page,
        lineItem: row.line_item,
        head: row.head,
        category: row.category,
        extractCat: row.extractcat,
      };

      for (const mlColumnIndex of Reflect.ownKeys(columnMapping)) {
        const columnKey = existingColumns[columnMapping[mlColumnIndex]].key;
        if (columnKey !== 'lineItem') {
          dataRow[columnKey] = row[mlColumnIndex];
        }
      }

      dataRows.push(dataRow);
    });
  }

  private fixNOIClassification(rows: CFDataRow[]) {
    let first = true;
    rows.forEach((row: CFDataRow) => {
      if (row['category'] === 'NOI') {
        if (first) {
          row['category'] = 'Net Operating Income';
          first = false;
        } else {
          row['category'] = 'Net Cash Flow';
        }
      }
    });
  }

  private fixTotalColumn(columns: CFDataColumn[]) {
    const monthlyColumns = columns.filter(
      (column: CFDataColumn) => column.type === 'actual' && column.period === 'monthly' && !column.discard,
    ) as CFDataColumn[];

    const sortedColumnDates = monthlyColumns.map((col) => col.periodEndDate).sort();
    const startMonth = sortedColumnDates[0].substring(5, 7);
    const endMonth = sortedColumnDates[sortedColumnDates.length - 1].substring(5, 7);
    const totalPeriod = endMonth === '12' ? 'yearly' :
      startMonth === '01' ? 'ytd' :
        Number(startMonth) - Number(endMonth) === 1 ? 'ttm' :
          '';
    if (totalPeriod !== '') {
      for (let i = 0; i < columns.length; i++) {
        if (
          columns[i].type === 'actual-total' &&
          columns[i].periodEndDate.substring(0, 4) === sortedColumnDates[sortedColumnDates.length - 1].substring(0, 4)
        ) {
          columns[i].period = totalPeriod;
          columns[i].periodEndDate = sortedColumnDates[sortedColumnDates.length - 1];
          break;
        }
      }
    }
  }
}
