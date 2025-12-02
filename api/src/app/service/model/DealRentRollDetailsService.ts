import { DateTime } from 'luxon';
import { injectable } from '../../boot';
import { Deal } from '../../db/entity/Deal';
import { Document } from '../../db/entity/Document';
import { DocumentData } from '../../db/entity/DocumentData';
import { DocumentStatus } from '../../models/enums/DocumentStatus';
import {
  RRFExtractedData,
  RRFDataColumn,
  RRFDataRow,
  ChargeCodeData,
  ChargeCodeValue,
  FPConfig, RRFColumn, OccupancyConfig,
} from '../../types';
import { RentRollChargeCode } from '../../models/enums/RentRollChargeCode';
import { RentRollFixedField, RRUnitInformationField } from '../../models/enums/RentRollFieldEnum';
import { RentRollOccupancyStatus } from '../../models/enums/RentRollOccupancyStatus';

/* eslint-disable camelcase */
interface RRDataOutput {
  asOnDate?: string;
  unit?: string | number;
  tenant_code?: string | number;
  tenant_name?: string;
  floor_plan?: string | number;
  sq_ft?: string | number;
  status?: string;
  market_rent?: string | number;
  no_of_bedrooms?: string | number;
  no_of_bathrooms?: string | number;
  unit_type?: string;
  start_date?: string;
  lease_term?: string;
  move_in_date?: string;
  move_out_date?: string;
  Renovated?: string | boolean;
  Affordable?: string | boolean;
}

/* eslint-enable camelcase */

interface FloorPlanSummary {
  [floorPlan: string]: {
    count: number,
    countOccupied: number,
    countVacant: number,
    countNonRevenue: number,
    beds: number | string,
    baths: number | string,
    totalSqFt: number,
    totalMonthlyRent: number;
    totalMarketRent: number;
    asOnDate: string;
    countRenovated: number;
    countMTM: number;
  };
}

interface GetDataOptions {
  rentRollIds?: string[];
}


@injectable()
export class DealRentRollDetailsService {
  getChargeCodeValue(chargeCodeValue: ChargeCodeValue): number {
    let value;
    if (typeof chargeCodeValue === 'object') {
      value = chargeCodeValue.sum;
    } else {
      value = chargeCodeValue;
    }

    // @ts-ignore
    value = parseFloat(value);
    if (isNaN(value)) {
      value = 0;
    }

    return value;
  }

  async getData(
    deal: Deal, options?: GetDataOptions,
  ): Promise<{ rentRollData: RRDataOutput[], floorPlanSummary: FloorPlanSummary }> {
    const rentRolls = await deal.rentRolls;
    const validatedRentRolls = options?.rentRollIds ?
      // validated check is skipped for this case assuming only validated docs list will be passed
      rentRolls.filter((doc: Document) => options.rentRollIds.includes(doc.id)) :
      rentRolls.filter((doc: Document) => doc.status === DocumentStatus.Validated);

    let latestRRDocument = null;
    for (const doc of validatedRentRolls) {
      if (!latestRRDocument) {
        latestRRDocument = doc;
      } else {
        const RRAsOnDate = DateTime.fromISO(doc.asOnDate);
        const latestRRAsOnDate = DateTime.fromISO(latestRRDocument.asOnDate);
        latestRRDocument = latestRRAsOnDate.startOf('day') < RRAsOnDate.startOf('day') ? doc : latestRRDocument;
      }
    }

    if (latestRRDocument) {
      const documentData: DocumentData = await latestRRDocument.documentData;
      const editedData = documentData.editedData as RRFExtractedData;
      const validColumns = editedData.columns.filter((col: RRFDataColumn) => col.type !== 'chargeCode' && !col.discard);
      const ccColumns = editedData.columns.filter((col: RRFDataColumn) => col.type === 'chargeCode' && !col.discard);

      const rrCCColumnsObj = {};

      ccColumns.forEach((col: RRFDataColumn) =>
        RentRollChargeCode.all().forEach((cc) => {
          rrCCColumnsObj[cc.label] = rrCCColumnsObj[cc.label] || [];
          if (documentData.chargeCodeConfig[col.name] === cc.key) {
            rrCCColumnsObj[cc.label].push(col.key);
          }
        }),
      );

      const rentRollData = this.getRentRollData(latestRRDocument, editedData, validColumns, ccColumns, rrCCColumnsObj);
      const floorPlanSummary = this.getFloorPlanSummary(
        documentData,
        rrCCColumnsObj[RentRollChargeCode.MonthlyRent.label],
        latestRRDocument.asOnDate,
      );

      return { rentRollData, floorPlanSummary };
    }
    return { rentRollData: [], floorPlanSummary: {} };
  }

  getRentRollData(
    latestRRDocument: Document,
    editedData: RRFExtractedData,
    validColumns: RRFColumn[],
    ccColumns: RRFColumn[],
    rrCCColumnsObj: object,
  ): RRDataOutput[] {
    return editedData.rows.map((row: RRFDataRow) => {
      const rrRow = { asOnDate: latestRRDocument.asOnDate as string };
      validColumns.forEach((col: RRFDataColumn) => {
        rrRow[col.name] = row[col.key] ?? '';
      });
      Reflect.ownKeys(rrCCColumnsObj).forEach((cc) => {
        rrRow[cc] = rrCCColumnsObj[cc].reduce((sum, colKey) => {
          return sum + this.getChargeCodeValue(row[colKey] as ChargeCodeData);
        }, 0);
      });
      ccColumns.forEach((col: RRFDataColumn) => {
        rrRow[`charge_code_${col.name}`] = this.getChargeCodeValue(row[col.key] as ChargeCodeData);
      });
      return rrRow;
    });
  }


  getColumn(columns: RRFColumn[], columnName: string) {
    return columns.find(
      (column: RRFDataColumn) => column.name === columnName && !column.discard,
    );
  }

  getFloorPlaColumn(data: RRFExtractedData) {
    return this.getColumn(data.columns, RRUnitInformationField.floorPlan.key) ??
      this.getColumn(data.columns, RRUnitInformationField.unitType.key) ??
      this.getColumn(data.columns, RRUnitInformationField.sqFt.key);
  }


  getFloorPlanSummary(documentData: DocumentData, monthlyRentCCColumns: string[], asOnDate: string): FloorPlanSummary {
    const fpSummary: FloorPlanSummary = {};

    const data = documentData.editedData as RRFExtractedData;
    const fpConfig = documentData.floorPlanConfig as FPConfig;
    const occupancyConfig = documentData.occupancyConfig as OccupancyConfig;
    const floorPlanColumn = this.getFloorPlaColumn(data);
    const occupancyColumn = this.getColumn(data.columns, RRUnitInformationField.status.key);
    const sqFtColumn = this.getColumn(data.columns, RRUnitInformationField.sqFt.key);
    const marketRentColumn = this.getColumn(data.columns, RRUnitInformationField.marketRent.key);
    const renovatedColumn = this.getColumn(data.columns, RentRollFixedField.Renovated.key);
    const mtmColumn = this.getColumn(data.columns, RentRollFixedField.MTM.key);

    if (floorPlanColumn) {
      const fpKey = floorPlanColumn.key;
      data.rows.forEach((row) => {
        const fpValue = row[fpKey] as string ?? '';
        fpSummary[fpValue] = fpSummary[fpValue] ?? {
          beds: fpConfig[fpValue]?.beds,
          baths: fpConfig[fpValue]?.baths,
          count: 0,
          countOccupied: 0,
          countVacant: 0,
          countNonRevenue: 0,
          totalSqFt: 0,
          totalMonthlyRent: 0,
          totalMarketRent: 0,
          asOnDate: asOnDate,
          countRenovated: 0,
          countMTM: 0,
        };
        fpSummary[fpValue].count += 1;

        const status = row[occupancyColumn.key] as string;
        const occupancy = occupancyConfig?.[status];

        if (!occupancy || occupancy === RentRollOccupancyStatus.Occupied.key) {
          fpSummary[fpValue].countOccupied += 1;
        } else if (occupancy === RentRollOccupancyStatus.Vacant.key) {
          fpSummary[fpValue].countVacant += 1;
        } else {
          fpSummary[fpValue].countNonRevenue += 1;
        }

        if (row[renovatedColumn.key] === 'Yes') {
          fpSummary[fpValue].countRenovated += 1;
        }

        if (row[mtmColumn.key] === 'Yes') {
          fpSummary[fpValue].countMTM += 1;
        }

        fpSummary[fpValue].totalMonthlyRent += monthlyRentCCColumns.reduce((sum, colKey) => {
          return sum + this.getChargeCodeValue(row[colKey] as ChargeCodeData);
        }, 0);
        let sqft = parseInt(row[sqFtColumn?.key] as string);
        if (isNaN(sqft)) {
          sqft = 0;
        }
        fpSummary[fpValue].totalSqFt += sqft;
        let marketRent = parseFloat(row[marketRentColumn?.key] as string);
        if (isNaN(marketRent)) {
          marketRent = 0;
        }
        fpSummary[fpValue].totalMarketRent += marketRent ?? 0;
      });
    }
    return fpSummary;
  }
}
