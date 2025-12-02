import { Service } from '../../../bootstrap/service/Service';
import {
  CFColumn,
  CFDataColumn, CFDataRow,
  CFExtractedData, CFSummaryCalculatedRow,
  CFStaticColumn,
  CFSummaryAmounts,
  ExtractedData,
} from '../../../types';
import { GPRChartCategories, OperatingExpensesChartCategories } from '../../../constants';
import { SheetsData } from '../xlsx/XlsxPopulateService';
import { DateTime } from 'luxon';
import { isoMonthToShortDate } from '../utils/utils';
import { ColKeySeparator } from './CashFlowSummaryExportService';
import { CashFlowSummaryData } from '../../components/app/deal/document/cashFlow/dashboard/DocumentSummaryView';

export class CashFlowDataService extends Service {
  getSummarizableColumns(data: ExtractedData) {
    const columns = data.columns as CFColumn[];
    return columns.filter((c: CFColumn) => {
      if ((c as CFStaticColumn).isStatic) {
        return false;
      }

      if ((c as CFDataColumn).discard) {
        return false;
      }

      return (
        ['actual', 'budget', 'appraisal', 'actual-total', 'budget-total', 'appraisal-total']
          .includes((c as CFDataColumn).type)
      );
    });
  }

  getDetailedSummary(data: ExtractedData, columnKey: string) {
    const income = {
      total: 0,
      categories: {},
    };

    const expense = {
      total: 0,
      categories: {},
    };

    const capEx = {
      total: 0,
      categories: {},
    };

    const totalSummary = {
      total: -1,
      categories: {
        'Total Income': 0,
        'Less: Excluded Income': 0,
        'Adjusted Income': 0,
        'Total Expense': 0,
        'Less: Excluded Expense': 0,
        'Adjusted Expense': 0,
        'Net Operating Income': 0,
        'Total Capital Expense': 0,
        'Net Cash Flow': 0,
      },
    };

    if (data && columnKey) {
      data.rows.forEach((row) => {
        let value = parseFloat(row[columnKey]);
        if (isNaN(value)) {
          value = 0;
        }

        let group;
        if (row.head === 'Income') {
          group = income;
          totalSummary.categories['Total Income'] += value;
        } else if (row.head === 'Expense') {
          group = expense;
          totalSummary.categories['Total Expense'] += value;
        } else if (row.head === 'Capital Expense') {
          group = capEx;
          totalSummary.categories['Total Capital Expense'] += value;
        } else {
          // ignore others
        }

        if (group) {
          if (row.category === 'Excluded Income') {
            totalSummary.categories['Less: Excluded Income'] += value;
          } else if (row.category === 'Excluded Expense') {
            totalSummary.categories['Less: Excluded Expense'] += value;
          }

          group.total += value;
          if (row.category) {
            group.categories[row.category] = group.categories[row.category] ?? 0;
            group.categories[row.category] += value;
          } else {
            group.categories['Others'] = group.categories['Others'] ?? 0;
            group.categories['Others'] += value;
          }
        }
      });

      totalSummary.categories['Adjusted Income'] =
        totalSummary.categories['Total Income'] - totalSummary.categories['Less: Excluded Income'];
      totalSummary.categories['Adjusted Expense'] =
        totalSummary.categories['Total Expense'] - totalSummary.categories['Less: Excluded Expense'];
      totalSummary.categories['Net Operating Income'] =
        totalSummary.categories['Adjusted Income'] - totalSummary.categories['Adjusted Expense'];
      totalSummary.categories['Net Cash Flow'] =
        totalSummary.categories['Net Operating Income'] - totalSummary.categories['Total Capital Expense'];
    }

    for (const group of [income, expense, capEx, totalSummary]) {
      group.total = Math.round(group.total * 100) / 100;
      for (const c of Reflect.ownKeys(group.categories)) {
        group.categories[c] = Math.round(group.categories[c] * 100) / 100;
      }
    }

    return {
      income,
      expense,
      capEx,
      totalSummary,
    };
  }

  calculateSummary(data: ExtractedData, columnKey: string): CFSummaryAmounts {
    let totalIncome = 0;
    let totalExpense = 0;
    let totalCapEx = 0;
    let noi = 0;
    let ncf = 0;

    if (data && columnKey) {
      data.rows.forEach((row) => {
        let value = parseFloat(row[columnKey]);

        if (isNaN(value)) {
          value = 0;
        }

        if (row.head === 'Income') {
          totalIncome += value;
        } else if (row.head === 'Expense') {
          totalExpense += value;
        } else if (row.head === 'Capital Expense') {
          totalCapEx += value;
        }
      });

      noi = totalIncome - totalExpense;
      ncf = noi - totalCapEx;
    }

    return {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpense: Math.round(totalExpense * 100) / 100,
      totalCapEx: Math.round(totalCapEx * 100) / 100,
      noi: Math.round(noi * 100) / 100,
      ncf: Math.round(ncf * 100) / 100,
    };
  }

  getCFSheetSummaryRows(data: CFExtractedData): CFSummaryCalculatedRow[] {
    const summaryRows: CFSummaryCalculatedRow[] = [
      ['NOI Calculated'],
      ['NOI Actual (Mapped Total)'],
      ['NOI Variance'],
      ['NOI Adjusted (W/O Excluded)'],
      ['NCF Calculated'],
      ['NCF Actual (Mapped Total)'],
      ['NCF Variance'],
      ['NCF Adjusted (W/O Excluded)'],
    ].map(([summaryType]: [string, string], idx: number) => {
      return ({
        id: 9000000 + idx,
        __isSummary: true,
        lineItem: '',
        head: '-',
        category: summaryType,
        matched: [],
      });
    });

    const noiDataRow = data.rows.find((r) => r.category === 'Net Operating Income') ?? {};
    const ncfDataRow = data.rows.find((r) => r.category === 'Net Cash Flow') ?? {};

    const summarizableColumns = this.getSummarizableColumns(data);
    for (const summaryColumn of summarizableColumns) {
      let totalIncome = 0;
      let totalExpense = 0;
      let totalCapEx = 0;
      let totalExcluded = 0;
      let omittedIncome = 0;
      let omittedExpense = 0;
      let omittedCapEx = 0;

      for (const row of data.rows) {
        let value = parseFloat(row[summaryColumn.key]);
        if (isNaN(value)) {
          value = 0;
        }

        if (row.head === 'Income') {
          totalIncome += value;
          if (row.category === 'Excluded Income') {
            totalExcluded += value;
          }
        } else if (row.head === 'Expense') {
          totalExpense += value;
          if (row.category === 'Excluded Expense') {
            totalExcluded -= value;
          }
        } else if (row.head === 'Capital Expense') {
          totalCapEx += value;
        } else if (row.head === 'Omitted Items') {
          if (row.category === 'Omitted Income') {
            omittedIncome += value;
          } else if (row.category === 'Omitted Expense') {
            omittedExpense += value;
          } else if (row.category === 'Omitted Capital Expense') {
            omittedCapEx += value;
          }
        }
      }

      const noiCalculated = Number((totalIncome - totalExpense).toFixed(3));
      const noiActual = Number((noiDataRow[summaryColumn.key] ?? 0).toFixed(3)) - (
        omittedIncome - omittedExpense - omittedCapEx
      );
      const noiVariance = Number((noiCalculated - noiActual).toFixed(3));
      const noiAdjusted = Number((noiCalculated - totalExcluded).toFixed(3));
      const ncfCalculated = Number((totalIncome - totalExpense - totalCapEx).toFixed(3));
      const ncfActual = Number((ncfDataRow[summaryColumn.key] ?? 0).toFixed(3)) - (
        omittedIncome - omittedExpense - omittedCapEx
      );
      const ncfVariance = Number((ncfCalculated - ncfActual).toFixed(3));
      const ncfAdjusted = Number((ncfCalculated - totalExcluded).toFixed(3));

      summaryRows[0][summaryColumn.key] = noiCalculated;
      summaryRows[1][summaryColumn.key] = noiActual;
      summaryRows[2][summaryColumn.key] = noiVariance;
      summaryRows[3][summaryColumn.key] = noiAdjusted;
      summaryRows[4][summaryColumn.key] = ncfCalculated;
      summaryRows[5][summaryColumn.key] = ncfActual;
      summaryRows[6][summaryColumn.key] = ncfVariance;
      summaryRows[7][summaryColumn.key] = ncfAdjusted;

      if (Math.abs(noiVariance) <= 5) {
        summaryRows[0].matched.push(summaryColumn.key);
        summaryRows[1].matched.push(summaryColumn.key);
        summaryRows[2].matched.push(summaryColumn.key);
      }

      if (Math.abs(ncfVariance) <= 5) {
        summaryRows[4].matched.push(summaryColumn.key);
        summaryRows[5].matched.push(summaryColumn.key);
        summaryRows[6].matched.push(summaryColumn.key);
      }
    }

    return summaryRows;
  }

  dataToSimpleJSON(data: CFExtractedData) {
    const typeRow = [];
    const periodRow = [];
    const endDateRow = [];
    const dataRows = [];

    let firstRowProcessed = false;
    for (const row of data.rows) {
      const dataRow = [];

      for (const col of data.columns) {
        if ((col as CFStaticColumn).isStatic) {
          if (!firstRowProcessed) {
            const sCol = col as CFStaticColumn;
            typeRow.push(sCol.label);
            periodRow.push('');
            endDateRow.push('');
          }
          dataRow.push(row[col.key]);
        } else {
          const dCol = col as CFDataColumn;
          if (!firstRowProcessed) {
            typeRow.push(dCol.type);
            periodRow.push(dCol.period);
            endDateRow.push(dCol.periodEndDate);
          }
          dataRow.push(row[col.key]);
        }
      }
      firstRowProcessed = true;
      dataRows.push(dataRow);
    }

    const jsonData: (string | number)[][] = [
      typeRow,
      periodRow,
      endDateRow,
      ...dataRows,
    ];

    return jsonData;
  }

  buildExportCFWorkbookData(columns: CFColumn[], simpleJsonData: (string | number)[][]) {
    const headerRows = simpleJsonData.filter((row, idx) => idx < 3);
    const dataRows = simpleJsonData.filter((row, idx) => idx > 2);
    const discardedColumnIndices = columns.reduce((indices: number[], col: CFDataColumn, idx: number) => {
      if (col.hasOwnProperty('discard') && col.discard) {
        indices.push(idx);
      }
      return indices;
    }, []);


    const sheetsData: SheetsData = {
      CF_WORKBOOK: {
        CF_WB_TABLE: {
          data: dataRows as any[][],
          freezeCell: 'E6',
          allowFilter: true,
          hasSummaryRow: false,
          applyDefaultStyling: true,
          discardedColumnIndices,
          header: headerRows[0].map((val: string) => ({
            name: ['Line Item', 'Head', 'Category'].includes(val) ? '' : val.toUpperCase(),
            mergeCount: 1,
          })),
          subHeader: headerRows[1].map((subH: string, idx: number) => subH.toUpperCase()),
          subSubHeader:
            ['LINE ITEM', 'HEAD', 'CHART OF ACCOUNTS',
              ...headerRows[2].filter((val: string, idx: number) => idx > 2).map((val: string) => {
                const dateTime = DateTime.fromFormat(val, 'yyyy-mm-dd');
                return (dateTime.isValid) ? isoMonthToShortDate(val) : val;
              })],
        },
      },
    };

    return sheetsData;
  }

  getGPRChartSummary(data: CFExtractedData) {
    const monthlyColumns =
      data.columns.filter((col: CFDataColumn) => col?.period === 'monthly' && col?.type === 'actual' && !col?.discard);
    const gprChartData = {};


    monthlyColumns.forEach((col: CFDataColumn) => {
      gprChartData[col.periodEndDate] = gprChartData[col.periodEndDate] ??
        GPRChartCategories.reduce((obj: object, key: string) => {
          obj[key] = 0;
          return obj;
        }, {});
      data.rows.forEach((row: CFDataRow) => {
        if (row?.head === 'Income') {
          if (row?.category === 'Market Rent' || row?.category === 'Loss to Lease') {
            gprChartData[col.periodEndDate]['Gross Potential Rent'] += row[col.key] ?? 0;
          }
          if (row?.category === 'Collection Loss') {
            gprChartData[col.periodEndDate]['Collection Loss'] += row[col.key] ?? 0;
          }
          if (row?.category === 'Non - Revenue Units') {
            gprChartData[col.periodEndDate]['Non - Revenue Units'] += row[col.key] ?? 0;
          }
          if (row?.category === 'Concessions') {
            gprChartData[col.periodEndDate]['Concessions'] += row[col.key] ?? 0;
          }
          if (row?.category === 'Physical Vacancy') {
            gprChartData[col.periodEndDate]['Physical Vacancy'] += row[col.key] ?? 0;
          }
        }
      });
    });
    return gprChartData;
  }

  getOperatingExpensesSummary(data: CFExtractedData) {
    const monthlyColumns =
      data.columns.filter((col: CFDataColumn) => col?.period === 'monthly' && col?.type === 'actual' && !col?.discard);
    const totalColumn = data.columns.find((col: CFDataColumn) => col?.type === 'actual-total');

    const operatingExpensesData = OperatingExpensesChartCategories.reduce((val: object, cat: string) => {
      val[cat] = 0;
      return val;
    }, {});

    data.rows.forEach((row: CFDataRow) => {
      if (row?.head === 'Expense' && OperatingExpensesChartCategories.includes(row?.category)) {
        if (monthlyColumns?.length > 0) {
          monthlyColumns.forEach((col: CFDataColumn) => {
            operatingExpensesData[row.category] += row[col.key] ?? 0;
          });
        } else if (totalColumn) {
          operatingExpensesData[row.category] += row[totalColumn.key] ?? 0;
        }
      }
    });
    return operatingExpensesData;
  }

  getSummaryDataHeaderName(colKey: string) {
    const parts = colKey.split(ColKeySeparator);
    if (parts[0] === 'yearly') {
      return `Year ${parts[1].substring(0, 4)}`;
    } else if (parts[0] === 'ttm') {
      const endDate = DateTime.fromISO(parts[1]);
      const startDate = endDate.minus({ year: 1, day: -1 });
      return `Trailing 12 (${startDate.toFormat('MMM yyyy')} - ${endDate.toFormat('MMM yyyy')})`;
    } else if (parts[0] === 'ytd') {
      const endDate = DateTime.fromISO(parts[1]);
      return `YTD (Jan ${endDate.year} - ${endDate.toFormat('MMM yyyy')})`;
    }

    return colKey;
  }

  getSummaryDataColumns(summaryData: CashFlowSummaryData) {
    const staticColumnsSet = new Set(['category', 'isData', 'isDisplayHeader', 'isSubTotalHeader', 'isTotalHeader']);
    const dataColumnsSet = new Set<string>();

    for (const row of summaryData.values()) {
      for (const colKey of Reflect.ownKeys(row) as string[]) {
        if (!staticColumnsSet.has(colKey)) {
          dataColumnsSet.add(colKey);
        }
      }
    }

    return dataColumnsSet;
  }
}

export const useCashFlowDataService: () => CashFlowDataService = () => CashFlowDataService.useService();
