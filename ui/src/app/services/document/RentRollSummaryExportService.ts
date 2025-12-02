import * as XlsxPopulate from 'xlsx-populate';
import {
  rrExportWorkbookSheets,
  rrSummaryTables,
  rrDataExportTable,
} from '../../../constants';
import { RentRollDataService, RentSummary, UnitSummary } from './RentRollDataService';
import { formatAmount } from '../utils/utils';
import {
  Deal, DealDocument,
  ChargeCodeConfig,
  DocumentData,
  FPConfig,
  RRFColumn,
  RRFDataColumn,
  RRFExtractedData, RRSummaryData,
} from '../../../types';
import {
  RentRollFixedField,
  RRAdditionalField,
  RRLeaseTermsField,
  RRUnitInformationField,
} from '../../enums/RentRollFieldEnum';
import { RentRollChargeCode } from '../../enums/RentRollChargeCode';
import { ChargeCodeData } from '../../../../../api/src/app/types';
import { SheetsData, useXlsxPopulateService, XlsxPopulateService } from '../xlsx/XlsxPopulateService';
import { Service } from '../../../bootstrap/service/Service';


export class RentRollSummaryExportService extends Service {
  static useService(): RentRollSummaryExportService {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const xlsxPopulateService = useXlsxPopulateService();
    return this.getService(xlsxPopulateService);
  }

  constructor(private readonly xlsxPopulateService: XlsxPopulateService) {
    super();
  }

  transformRentSummary(rentSummary: RentSummary[], summaryRow: Partial<RentSummary>) {
    return [...rentSummary, summaryRow].map((summary: RentSummary) => {
      return [summary.summaryKey || '', formatAmount(summary.averageMarketRent || 0),
        summary.occupiedCount || 0,
        formatAmount(summary.occupiedAverageMarketRent || 0),
        formatAmount(summary.occupiedAverageInPlaceRent || 0),
        (summary.occupiedInPlacePercentOfMarketRent * 100).toFixed(2), summary.recent5Count,
        formatAmount(summary.recent5AverageInPlaceRent || 0),
        summary.last90DaysCount || 0,
        formatAmount(summary.last90DaysAverageInPlaceRent || 0),
        summary.last60DaysCount || 0,
        formatAmount(summary.last60DaysAverageInPlaceRent || 0),
        summary.last30DaysCount || 0,
        formatAmount(summary.last30DaysAverageInPlaceRent || 0),
      ];
    });
  }

  transformUnitSummary(rentSummary: UnitSummary[], summaryRow: Partial<UnitSummary>) {
    return [...rentSummary, summaryRow].map((summary: UnitSummary) => {
      return [summary.summaryKey || '', summary.beds || '', summary.baths || '', summary.sqFt || 0,
        summary.unitCount || 0,
        (summary.percentOfTotalUnits * 100).toFixed(2),
        (summary.percentOccupied * 100).toFixed(2), (summary.percentVacant * 100).toFixed(2),
        (summary.percentNonRevenue * 100).toFixed(2), summary.countOccupied || 0,
        summary.countVacant || 0, summary.countNonRevenue || 0,
        summary.countRenovated || 0, summary.countDown || 0, summary.countUnRenovated || 0];
    });
  }

  transformRentRollData(data: RRFExtractedData, fpConfig: FPConfig, ccConfig: ChargeCodeConfig) {
    const rows = [];
    const rentRollDataService: RentRollDataService = RentRollDataService.getService();
    const headerNamesMapObj = {
      'Unit No.': RRUnitInformationField.unit.key,
      'Floor Plan': RRUnitInformationField.floorPlan.key,
      'Unit Type': RRUnitInformationField.unitType.key,
      'Square Feet': RRUnitInformationField.sqFt.key,
      'Beds': 'beds',
      'Baths': 'baths',
      'Market Rent': RRUnitInformationField.marketRent.key,
      'Occupancy': RRUnitInformationField.status.key,
      'Lease Type': RRAdditionalField.leaseType.key,
      'Renovation Status': RentRollFixedField.Renovated.key,
      'Tenant Name': RRUnitInformationField.tenantName.key,
      'Tenant Code': RRUnitInformationField.tenantCode.key,
      'Lease Start Date': RRLeaseTermsField.startDate.key,
      'Lease End Date': RRLeaseTermsField.endDate.key,
      'Lease Term': RRLeaseTermsField.leaseTerm.key,
      'MTM': RentRollFixedField.MTM.key,
      'Move In Date': RRLeaseTermsField.moveInDate.key,
      'Move Out Date': RRLeaseTermsField.moveOutDate.key,
    };
    if (data && fpConfig && ccConfig) {
      const validColumns = Reflect.ownKeys(headerNamesMapObj).map((col) => {
        const column = data?.columns.find((c: RRFColumn) => c.name === headerNamesMapObj[col] && !column?.discard);
        return column ? column.key : undefined;
      });
      const ccColumns = data?.columns.filter((col: RRFDataColumn) => col.type === 'chargeCode' && !col.discard);

      const rrCCColumnsObj = {};

      ccColumns.forEach((col: RRFDataColumn) =>
        RentRollChargeCode.all().forEach((cc) => {
          rrCCColumnsObj[cc.label] = rrCCColumnsObj[cc.label] || [];
          if (ccConfig[col.name] === cc.key) {
            rrCCColumnsObj[cc.label].push(col.key);
          }
        }),
      );

      data?.rows.forEach((row) => {
        const rowData = [];
        validColumns.forEach((col) => {
          if (col) {
            rowData.push(row[col] ?? '');
          } else {
            rowData.push('');
          }
        });
        const floorPlanColumn = rentRollDataService.getFloorPlaColumn(data);
        if (floorPlanColumn) {
          const fp = row[floorPlanColumn.key] as string;
          const config = fpConfig[fp] ?? { beds: '', baths: '' };
          rowData[4] = config.beds;
          rowData[5] = config.baths;
        }
        Reflect.ownKeys(rrCCColumnsObj).forEach((cc: string) => {
          const val = rrCCColumnsObj[cc].reduce((sum, colKey) => {
            return sum + rentRollDataService.getChargeCodeValue(row[colKey] as ChargeCodeData);
          }, 0);
          rowData.push(val);
        });
        rows.push(rowData);
      });
    }
    return rows;
  };

  async getSummaryDataXlsx(
    deal: Deal,
    document: DealDocument,
    documentData: DocumentData,
    summaries: RRSummaryData,
    fpConfig: FPConfig,
    ccConfig: ChargeCodeConfig,
  ): Promise<XlsxPopulate.Workbook> {
    const {
      fpRentSummary, bedsRentSummary, sqFtRentSummary, fpNameRentSummary,
      fpUnitSummary, bedsUnitSummary, sqFtUnitSummary, fpNameUnitSummary,
      fpRentSummarySummary, bedsRentSummarySummary, fpNameRentSummarySummary, sqFtRentSummarySummary,
      fpUnitSummarySummary, bedsUnitSummarySummary, fpNameUnitSummarySummary, sqFtUnitSummarySummary,
    } = summaries;
    const data: SheetsData = {
      FLOOR_PLAN_SUMMARY: {
        RENT_SUMMARY_TABLE: {
          ...rrSummaryTables.RENT_SUMMARY_TABLE,
          data: this.transformRentSummary(fpRentSummary, fpRentSummarySummary),
        },
        UNIT_SUMMARY_TABLE: {
          ...rrSummaryTables.UNIT_SUMMARY_TABLE,
          data: this.transformUnitSummary(fpUnitSummary, fpUnitSummarySummary),
        },
      },
      UNIT_TYPE_SUMMARY: {
        RENT_SUMMARY_TABLE: {
          ...rrSummaryTables.RENT_SUMMARY_TABLE,
          data: this.transformRentSummary(bedsRentSummary, bedsRentSummarySummary),
        },
        UNIT_SUMMARY_TABLE: {
          ...rrSummaryTables.UNIT_SUMMARY_TABLE,
          data: this.transformUnitSummary(bedsUnitSummary, bedsUnitSummarySummary),
        },
      },
      UNIT_SIZE_SUMMARY: {
        RENT_SUMMARY_TABLE: {
          ...rrSummaryTables.RENT_SUMMARY_TABLE,
          data: this.transformRentSummary(sqFtRentSummary, sqFtRentSummarySummary),
        },
        UNIT_SUMMARY_TABLE: {
          ...rrSummaryTables.UNIT_SUMMARY_TABLE,
          data: this.transformUnitSummary(sqFtUnitSummary, sqFtUnitSummarySummary),
        },
      },
      FLOOR_PLAN_NAME_SUMMARY: {
        RENT_SUMMARY_TABLE: {
          ...rrSummaryTables.RENT_SUMMARY_TABLE,
          data: this.transformRentSummary(fpNameRentSummary, fpNameRentSummarySummary),
        },
        UNIT_SUMMARY_TABLE: {
          ...rrSummaryTables.UNIT_SUMMARY_TABLE,
          data: this.transformUnitSummary(fpNameUnitSummary, fpNameUnitSummarySummary),
        },
      },
      RENT_ROLL: {
        RR_TABLE: {
          ...rrDataExportTable,
          data: this.transformRentRollData(documentData?.editedData as RRFExtractedData, fpConfig, ccConfig),
        },
      },
    };
    return await this.xlsxPopulateService.getXlsxWorkbook(deal, document, rrExportWorkbookSheets, data);
  }
}

export const useRentRollSummaryExportService: () =>
  RentRollSummaryExportService = () => RentRollSummaryExportService.useService();
