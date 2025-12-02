import * as XlsxPopulate from 'xlsx-populate';
import { SheetsData, StyledRows, useXlsxPopulateService, XlsxPopulateService } from '../xlsx/XlsxPopulateService';
import { Service } from '../../../bootstrap/service/Service';
import { CashFlowSummaryData } from '../../components/app/deal/document/cashFlow/dashboard/DocumentSummaryView';
import { CashFlowDataService } from './CashFlowDataService';
import { formatAmount } from '../utils/utils';
import { Deal, DealDocument } from '../../../types';


export class CashFlowSummaryXlsxService extends Service {
  static useService(): CashFlowSummaryXlsxService {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const xlsxPopulateService = useXlsxPopulateService();
    return this.getService(xlsxPopulateService);
  }

  constructor(private readonly xlsxPopulateService: XlsxPopulateService) {
    super();
  }

  async getSummaryDataXlsx(
    deal: Deal,
    document: DealDocument,
    summaryData: CashFlowSummaryData,
  ): Promise<XlsxPopulate.Workbook> {
    const cfDataService = CashFlowDataService.getService();
    const dataColumnsSet = cfDataService.getSummaryDataColumns(summaryData);
    const dataColumns = [...dataColumnsSet].sort();

    const dataRows = [];

    const subHeaderRowsStylingObj: StyledRows = {};

    let rowIdx = 0;

    for (const row of summaryData.values()) {
      const dataRow = [];
      dataRow.push(row.category || '');
      dataColumns.forEach((col: string) => {
        if (row.isDisplayHeader) {
          dataRow.push('');
        } else {
          dataRow.push(formatAmount(row[col] ?? 0));
        }
      });
      dataRows.push(dataRow);
      if (row.isDisplayHeader) {
        subHeaderRowsStylingObj[rowIdx] = {
          fillColor: '145d97',
          fontColor: 'ffffff',
          borderColor: '000000',
          bold: false,
        };
      } else if (row.isSubTotalHeader) {
        subHeaderRowsStylingObj[rowIdx] = {
          fillColor: 'f0f0f0',
          fontColor: '000000',
          borderColor: '000000',
          bold: false,
        };
      } else if (row.isTotalHeader) {
        subHeaderRowsStylingObj[rowIdx] = {
          fillColor: 'd0d0d0',
          fontColor: '000000',
          borderColor: '000000',
          bold: true,
        };
      } else {
        subHeaderRowsStylingObj[rowIdx] = {
          fillColor: 'ffffff',
          fontColor: '000000',
          borderColor: '000000',
          bold: false,
        };
      }
      ++rowIdx;
    }

    const sheetsData: SheetsData = {
      CF_SUMMARY: {
        CF_SUMMARY_TABLE: {
          data: dataRows as any[][],
          freezeCell: false,
          allowFilter: true,
          hasSummaryRow: false,
          header: [{
            name: 'Category',
            mergeColCount: 1,
          }, ...dataColumns.map((val: string) => ({
            name: cfDataService.getSummaryDataHeaderName(val),
            mergeCount: 1,
          }))],
          subHeader: [],
          styledRows: subHeaderRowsStylingObj,
          applyDefaultStyling: false,
        },
      },
    };

    return await this.xlsxPopulateService.getXlsxWorkbook(deal, document, { CF_SUMMARY: 'Sheet 1' }, sheetsData);
  }
}

export const useCashFlowSummaryXlsxService: () =>
  CashFlowSummaryXlsxService = () => CashFlowSummaryXlsxService.useService();
