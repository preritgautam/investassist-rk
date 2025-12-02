import { Service } from '../../../bootstrap/service/Service';
import { CFDataColumn, CFDataRow, CFExtractedData, CFStaticColumn, SummaryItem } from '../../../types';

export interface RawSummaryRow {
  category: string;
}

export interface ViewSummaryRow {
  isDisplayHeader?: boolean;
  isTotalHeader?: boolean;
  isSubTotalHeader?: boolean;
  isData?: boolean;
  category?: string;
}

export const ColKeySeparator = '>|<';

export class CashFlowSummaryExportService extends Service {
  getRawSummaryData(data: CFExtractedData) {
    const totalColumns = data.columns.filter((column: CFDataColumn) => {
      return (
        !(column as unknown as CFStaticColumn).isStatic &&
        column.type.startsWith('actual') &&
        ['ytd', 'ttm', 'yearly'].includes(column.period) &&
        column.discard !== true
      );
    });


    let monthColumns: CFDataColumn[] = [];
    let calculatedMonthsTotalKey = null;
    let quarterColumns: CFDataColumn[] = [];
    let calculatedQuartersTotalKey = null;

    // If no total columns found, try to find monthly columns
    if (totalColumns.length === 0) {
      monthColumns = data.columns.filter((column: CFDataColumn) => {
        return (
          !(column as unknown as CFStaticColumn).isStatic &&
          column.type.startsWith('actual') &&
          column.period === 'monthly' &&
          column.discard !== true
        );
      }).sort((c1: CFDataColumn, c2: CFDataColumn) => {
        return Number(new Date(c1.periodEndDate)) - Number(new Date(c2.periodEndDate));
      }) as CFDataColumn[];

      if (monthColumns.length > 0) {
        const endMonth = Number(monthColumns[monthColumns.length - 1].periodEndDate.substring(5, 7));
        const startMonth = Number(monthColumns[0].periodEndDate.substring(5, 7));
        calculatedMonthsTotalKey = startMonth === 1 ?
          endMonth === 12 ? 'yearly' : 'ytd' :
          'ttm';
        calculatedMonthsTotalKey =
          `${calculatedMonthsTotalKey}${ColKeySeparator}${monthColumns[monthColumns.length - 1].periodEndDate}`;
      } else {
        // May be not needed, but try with quarterly columns since we have quarterly columns support
        quarterColumns = data.columns.filter((column: CFDataColumn) => {
          return (
            !(column as unknown as CFStaticColumn).isStatic &&
            column.type.startsWith('actual') &&
            column.period === 'quarterly' &&
            column.discard !== true
          );
        }).sort((c1: CFDataColumn, c2: CFDataColumn) => {
          return Number(new Date(c1.periodEndDate)) - Number(new Date(c2.periodEndDate));
        }) as CFDataColumn[];

        if (quarterColumns.length > 0) {
          const endMonth = Number(monthColumns[monthColumns.length - 1].periodEndDate.substring(5, 7));
          const startMonth = Number(monthColumns[0].periodEndDate.substring(5, 7));
          calculatedQuartersTotalKey = startMonth === 1 ?
            endMonth === 12 ? 'yearly' : 'ytd' :
            'ttm';
          calculatedQuartersTotalKey =
            `${calculatedQuartersTotalKey}${ColKeySeparator}${monthColumns[monthColumns.length - 1].periodEndDate}`;
        }
      }
    }

    function updateSummaryRow(summaryRow: RawSummaryRow, row: CFDataRow) {
      if (totalColumns.length) {
        totalColumns.forEach((column: CFDataColumn) => {
          const columnKey = `${column.period}${ColKeySeparator}${column.periodEndDate}`;
          summaryRow[columnKey] = summaryRow[columnKey] ?? 0;
          let rowValue = Number(row[column.key]);
          if (isNaN(rowValue)) {
            rowValue = 0;
          }
          summaryRow[columnKey] += rowValue;
        });
      } else if (monthColumns.length) {
        const monthsTotalValue = monthColumns.reduce((total: number, column: CFDataColumn) => {
          let colValue = row[column.key];
          if (isNaN(colValue)) {
            colValue = 0;
          }
          return total + colValue;
        }, 0);
        summaryRow[calculatedMonthsTotalKey] = summaryRow[calculatedMonthsTotalKey] ?? 0;
        summaryRow[calculatedMonthsTotalKey] += monthsTotalValue;
      } else if (quarterColumns.length > 0) {
        const quartersTotalValue = quarterColumns.reduce((total: number, column: CFDataColumn) => {
          let colValue = row[column.key];
          if (isNaN(colValue)) {
            colValue = 0;
          }
          return total + colValue;
        }, 0);
        summaryRow[calculatedQuartersTotalKey] = summaryRow[calculatedQuartersTotalKey] ?? 0;
        summaryRow[calculatedQuartersTotalKey] += quartersTotalValue;
      }
    }

    const summary: Record<string, RawSummaryRow> = {};

    data.rows.forEach((row: CFDataRow) => {
      const category = row['category'];
      summary[category] = summary[category] ?? { category };
      updateSummaryRow(summary[category], row);
    });

    return summary;
  }

  getSummaryViewData(rawSummary: Record<string, RawSummaryRow>, summaryItems: SummaryItem[]) {
    const viewSummary: Map<string, ViewSummaryRow> = new Map();

    function addTotalRow(
      categories: string[], totalHeader: string, isSubTotalHeader: boolean, isTotalHeader: boolean,
      rowSigns = [],
    ) {
      const totalRow: ViewSummaryRow = { category: totalHeader, isSubTotalHeader, isTotalHeader };
      categories.forEach((category: string, index: number) => {
        if (viewSummary.has(category)) {
          const categoryRow = viewSummary.get(category);
          Reflect.ownKeys(categoryRow)
            .filter((k: string) => k.includes(ColKeySeparator))
            .forEach((totalHeader: string) => {
              totalRow[totalHeader] = totalRow[totalHeader] ?? 0;
              totalRow[totalHeader] += (Number(categoryRow[totalHeader]) || 0) * (rowSigns[index] ?? 1);
            });
        }
      });

      viewSummary.set(totalHeader, totalRow);
    }

    function addRowGroup(categories: string[], subHeader: string) {
      categories.forEach((category: string) => {
        if (rawSummary[category]) {
          viewSummary.set(category, { ...rawSummary[category], isData: true });
        } else {
          viewSummary.set(category, { category, isData: true });
        }
      });
      if (subHeader) {
        addTotalRow(categories, subHeader, true, false);
      }
    }

    summaryItems.forEach((item: SummaryItem) => {
      if (item.type === 'headerRow') {
        viewSummary.set(item.label, { isDisplayHeader: true, category: item.category });
      } else if (item.type === 'totalRow') {
        addTotalRow(item.categories, item.label, false, true, item.rowSigns);
      } else if (item.type === 'rowGroup') {
        addRowGroup(item.categories, item.label);
      }
    });

    // viewSummary.set('Operating Income', { isDisplayHeader: true, category: 'Operating Income' });
    //
    // addRowGroup(['Market Rent', 'Loss to Lease'], 'Gross Potential Rent');
    // addRowGroup([
    //   'Market Rent',
    //   'Loss to Lease',
    //   'Physical Vacancy',
    //   'Renovation Vacancy',
    //   'Non - Revenue Units',
    //   'Concessions',
    //   'Collection Loss',
    // ], 'Base Rental Income');
    // addRowGroup([
    //   'Expense Reimbursements',
    //   'Garage & Parking',
    //   'Storage',
    //   'Cable & Internet',
    //   'Valet Trash',
    //   'Deposit Forfeiture',
    //   'Pet Fees',
    //   'Miscellaneous Other Income',
    //   'Commercial Net Income',
    // ], 'Other Income');
    //
    // addTotalRow(['Base Rental Income', 'Other Income'], 'Effective Gross Income', false, true);
    //
    // viewSummary.set('Operating Expense', { isDisplayHeader: true, category: 'Operating Expense' });
    // addRowGroup([
    //   'Repairs & Maintenance',
    //   'Unit Turnovers',
    //   'Landscaping & Grounds',
    //   'Contract Services',
    //   'Security',
    //   'Payroll',
    //   'General & Administrative',
    //   'Marketing & Advertising',
    //   'Professional & Legal Fees',
    // ], 'Controllable Expenses');
    // addRowGroup([
    //   'Trash',
    //   'Electricity',
    //   'Fuel (Gas & Oil)',
    //   'Water & Sewer',
    //   'Other Utilities',
    //   'Insurance',
    //   'Reimbursements',
    //   'Other Expenses',
    // ], 'Non - Controllable Expenses');
    // addRowGroup([
    //   'Real Estate Taxes',
    //   'Management Fees',
    //   'Ground Rent',
    //   'Other Property Taxes',
    // ], 'Ground Rent & Taxes');
    //
    // addTotalRow(
    //   ['Controllable Expenses', 'Non - Controllable Expenses', 'Ground Rent & Taxes'],
    //   'Total Operating Expenses',
    //   false, true,
    // );
    //
    // addTotalRow(
    //   ['Effective Gross Income', 'Total Operating Expenses'],
    //   'Net Operating Income (Pre Reserves)', false, true,
    //   [1, -1],
    // );
    //
    // viewSummary.set('Capital Expenditure', { isDisplayHeader: true, category: 'Capital Expenditure' });
    // addRowGroup(['Replacement Reserve'], 'CapEx');
    //
    // addTotalRow(
    //   ['Net Operating Income (Pre Reserves)', 'CapEx'],
    //   'Net Operating Income (Post Reserves)', false, true,
    //   [1, -1],
    // );
    //
    // viewSummary.set('Excluded Items', { isDisplayHeader: true, category: 'Excluded Items' });
    // addRowGroup(['Excluded Income', 'Excluded Expense'], null);
    //
    //
    // addTotalRow(
    //   ['Net Operating Income (Post Reserves)', 'Excluded Income', 'Excluded Expense'],
    //   'Net Cash Flow', false, true,
    //   [1, 1, -1],
    // );

    return viewSummary;
  }
}

export const useCashFlowSummaryExportService: () => CashFlowSummaryExportService =
  () => CashFlowSummaryExportService.useService();
