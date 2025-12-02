import { Service } from '../../../bootstrap/service/Service';
import { CFDataColumn, CFDataRow, CFDiscrepancies, CFExtractedData } from '../../../types';
import { getMonth } from '../utils/utils';


export class CashFlowDiscrepanciesService extends Service {
  private discrepancies: CFDiscrepancies;
  private deviationPercent: number;

  constructor() {
    super();
    this.discrepancies = {};
    this.deviationPercent = 20;
  }

  resetDiscrepancies() {
    this.discrepancies = {};
  }

  findDiscrepancies(data: CFExtractedData) {
    this.resetDiscrepancies();

    let noiNCFRowFound = false;

    const noiNCFRows = [];

    const monthlyColumnKeys =
      data?.columns.filter((col: CFDataColumn) => col?.period === 'monthly' && col?.type === 'actual' && !col?.discard)
        .map((col: CFDataColumn) => col.key);


    data?.rows.forEach((row: CFDataRow, index: number) => {
      const monthlyDeviationCols = [];
      if (row?.head === 'NOI' && ['Net Cash Flow', 'Net Operating Income'].includes(row?.category)) {
        noiNCFRowFound = true;
        noiNCFRows.push({
          ...row,
          index,
        });
      }

      const validMonthlyCols = [];
      const monthlyColsTotal = monthlyColumnKeys.reduce((avg: number, colKey: string) => {
        if (!!row[colKey] && !isNaN(row[colKey])) {
          avg += isNaN(row[colKey]) ? 0 : row[colKey];
          validMonthlyCols.push(colKey);
        }
        return avg;
      }, 0);

      const monthlyColsAvg = monthlyColsTotal / (validMonthlyCols.length || 1);


      monthlyColumnKeys.forEach((colKey) => {
        if (!isNaN(row[colKey])) {
          const monthlyVal = row[colKey];
          const difference = monthlyVal > monthlyColsAvg ?
            Math.abs(monthlyVal - monthlyColsAvg) :
            Math.abs(monthlyColsAvg - monthlyVal);
          if (!!monthlyColsAvg && ((100 * difference) / monthlyColsAvg > this.deviationPercent)) {
            if (validMonthlyCols.includes(colKey)) {
              monthlyDeviationCols.push(colKey);
            }
          }
        }
      });

      if (!!monthlyDeviationCols.length) {
        const deviationMonths = [];
        monthlyDeviationCols.forEach((colKey) => {
          const column = data.columns.find((col: CFDataColumn) => col.key === colKey);
          if ('periodEndDate' in column) {
            const period = getMonth(column.periodEndDate);
            deviationMonths.push(period);
          }
        });
        this.discrepancies[`${row.id}__${row.lineItem}`] = this.discrepancies[`${row.id}__${row.lineItem}`] ?? [];

        this.discrepancies[`${row.id}__${row.lineItem}`].push({
          lineItem: row.lineItem,
          type: 'MonthlyNumberDeviation',
          message: 'Monthly amount deviates from average monthly amount by 20%',
          avgMonthlyAmount: monthlyColsAvg,
          row: index,
          deviationMonths,

        });
      }
    });

    this.checkNOINCFRowNotFoundDiscrepancy(noiNCFRowFound);
    this.checkMultipleNOINCFRowsDiscrepancy(noiNCFRows);

    return this.discrepancies;
  }


  checkNOINCFRowNotFoundDiscrepancy(noiNCFRowFound) {
    if (!noiNCFRowFound) {
      this.discrepancies[''] = this.discrepancies[''] ?? [];
      this.discrepancies[''].push({
        lineItem: '',
        type: 'NOINCFRowNotFound',
        message: 'No NOI/NCF row was found',
        row: null,
      });
    }
  }

  checkMultipleNOINCFRowsDiscrepancy(noiNCFRows) {
    if (noiNCFRows.length > 1) {
      noiNCFRows.forEach((row) => {
        this.discrepancies[`${row.id}__${row.lineItem}`] = this.discrepancies[`${row.id}__${row.lineItem}`] ?? [];
        this.discrepancies[`${row.id}__${row.lineItem}`].push({
          lineItem: row.lineItem,
          type: 'MultipleNOINCFRows',
          message: 'Multiple NOI/NCF rows found',
          row: row.index,
        });
      });
    }
  }
}

export const useCashFlowDiscrepanciesService: () =>
  CashFlowDiscrepanciesService = () => CashFlowDiscrepanciesService.useService();
