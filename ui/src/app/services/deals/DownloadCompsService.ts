import { Service } from '../../../bootstrap/service/Service';
import { SheetHeader, useXlsxPopulateService, XlsxPopulateService } from '../xlsx/XlsxPopulateService';
import { RRFColumn, RRFDataColumn, RRFStaticColumn } from '../../../types';
import { formatValue, getValue } from '../../components/app/deal/document/rentroll/editor/utils';
import { saveAs } from 'file-saver';

export class DownloadCompsService extends Service {
  static useService(): DownloadCompsService {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const xlsxPopulateService = useXlsxPopulateService();
    return this.getService(xlsxPopulateService);
  }

  constructor(private readonly xlsxPopulateService: XlsxPopulateService) {
    super();
  }

  async downloadCashFlowSummary(data: { columns: SheetHeader[], rows: any[][] }) {
    const sheetsData = {
      CASHFLOW_SUMMARY: {
        CASHFLOW_SUMMARY_TABLE: {
          header: data.columns,
          subHeader: [],
          allowFilter: true,
          freezeCell: false,
          hasSummaryRow: false,
          applyDefaultStyling: true,
          data: data.rows,
        },
      },
    };

    const xlsxData = await this.xlsxPopulateService.getXlsxWorkbook2(
      { CASHFLOW_SUMMARY: 'Cashflow Summary' }, sheetsData,
    );
    const workbook = await xlsxData.outputAsync();
    saveAs(workbook, 'cashflow.xlsx');
  }

  async downloadRentRollComps(summaries: {
    dealDetails: { columns: SheetHeader[], rows: any[][] },
    inPlaceRent: { columns: SheetHeader[], rows: any[][] },
    marketRent: { columns: SheetHeader[], rows: any[][] },
    unitSize: { columns: SheetHeader[], rows: any[][] },
  }) {
    const sheetsData = {
      RENT_ROLL_COMPS: {
        DEAL_DETAILS_TABLE: {
          header: summaries.dealDetails.columns,
          subHeader: [],
          allowFilter: true,
          freezeCell: false,
          hasSummaryRow: false,
          applyDefaultStyling: true,
          data: summaries.dealDetails.rows,
        },
        IN_PLACE_RENT_TABLE: {
          header: summaries.inPlaceRent.columns,
          subHeader: [],
          allowFilter: true,
          freezeCell: false,
          hasSummaryRow: true,
          applyDefaultStyling: true,
          data: summaries.inPlaceRent.rows,
        },
        MARKET_RENT_TABLE: {
          header: summaries.marketRent.columns,
          subHeader: [],
          allowFilter: true,
          freezeCell: false,
          hasSummaryRow: true,
          applyDefaultStyling: true,
          data: summaries.marketRent.rows,
        },
        UNIT_SIZE_TABLE: {
          header: summaries.unitSize.columns,
          subHeader: [],
          allowFilter: true,
          freezeCell: false,
          hasSummaryRow: true,
          applyDefaultStyling: true,
          data: summaries.unitSize.rows,
        },
      },
    };

    const xlsxData = await this.xlsxPopulateService.getXlsxWorkbook2(
      { RENT_ROLL_COMPS: 'Rentroll Comps' }, sheetsData,
    );
    const workbook = await xlsxData.outputAsync();
    saveAs(workbook, 'rentroll-comps.xlsx');
  }

  async downloadRentRollRollup(data: { rows: any[], columns: RRFColumn[] }) {
    const sheetsData = {
      RENT_ROLL_ROLLUP: {
        RENT_ROLL_ROLLUP_TABLE: {
          header: data.columns.map((column: RRFColumn) => {
            const dColumn: RRFDataColumn = column as RRFDataColumn;
            return {
              name: dColumn.header ?? (column as RRFStaticColumn).label,
              mergeColCount: null,
            };
          }),
          subHeader: [],
          allowFilter: true,
          freezeCell: false,
          hasSummaryRow: false,
          applyDefaultStyling: true,
          data: data.rows.map((row: object) => {
            return data.columns.map((column: RRFColumn) => {
              const value = getValue({ data: row }, column as RRFDataColumn);
              return formatValue({ value, data: row }, column as RRFDataColumn);
            });
          }),
        },
      },
    };

    const xlsxData = await this.xlsxPopulateService.getXlsxWorkbook2(
      { RENT_ROLL_ROLLUP: 'Rentroll Rollup' }, sheetsData,
    );
    const workbook = await xlsxData.outputAsync();
    saveAs(workbook, 'rentroll-rollup.xlsx');
  }
}

export const useDownloadCompsService: () => DownloadCompsService = () => DownloadCompsService.useService();
