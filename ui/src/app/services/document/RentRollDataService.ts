import { Service } from '../../../bootstrap/service/Service';
import {
  AffordableChartSummary,
  AffordableConfiguration, ChargeCodeChartSummary, ChargeCodeConfig,
  ChargeCodeData,
  ChargeCodeSummary,
  ChargeCodeValue, DocumentData,
  FloorPlanSqFtSummary,
  FloorPlanSummary,
  FPConfig, MtmConfiguration, NewLeasesChartSummary,
  NumericValue, OccupancyChartSummary, OccupancyConfig,
  OccupancySummary, RenovatedChartSummary,
  RenovationConfiguration,
  RRBedsUnitCountSummary, RRFColumn,
  RRFDataColumn,
  RRFDataRow,
  RRFExtractedData,
  RRFStaticColumn,
} from '../../../types';
import {
  RentRollChargeCodeField,
  RentRollFieldInterface,
  RentRollFixedField,
  RRAdditionalField,
  RRLeaseTermsField,
  RRUnitInformationField,
} from '../../enums/RentRollFieldEnum';
import { mmddyyyyToISO, parseNumeric, toAlphabetColumnName } from '../utils/utils';
import { AffordableLeaseTypes } from '../../enums/AffordableLeaseTypes';
import { RentRollChargeCode } from '../../enums/RentRollChargeCode';
import { RentRollOccupancyStatus } from '../../enums/RentRollOccupancyStatus';
import { DateTime } from 'luxon';
import { SheetsData } from '../xlsx/XlsxPopulateService';
import { BedsType } from '../../components/app/comps/RentrollComps';
import { getFpFloorPlan } from '../../constant/FPBedsBaths';

export interface _CompSummary {
  _summaryKey: string,
  count: number;
  occupiedCount: number;
  totalMarketRent: number;
  totalOccupiedMarketRent: number;
  totalNetEffectiveRent: number;
  totalOccupiedNetEffectiveRent: number;
  totalMonthlyRent: number;
  totalOccupiedMonthlyRent: number;
  totalSqFt: number;
  totalOccupiedSqFt: number;
}

export interface CompSummary {
  compsSummary: Record<string, _CompSummary>;
  totalUnitsCount: number;
  totalOccupiedUnits: number;
  totalMarketRent: number;
  totalOccupiedUnitsMarketRent: number;
  totalNetEffectiveRent: number;
  totalOccupiedNetEffectiveRent: number;
  totalMonthlyRent: number;
  totalOccupiedMonthlyRent: number;
  totalSqFt: number;
  totalOccupiedSqFt: number;
}

const EmptyCompsSummary = {
  count: 0,
  occupiedCount: 0,
  totalMarketRent: 0,
  totalOccupiedMarketRent: 0,
  totalNetEffectiveRent: 0,
  totalOccupiedNetEffectiveRent: 0,
  totalMonthlyRent: 0,
  totalOccupiedMonthlyRent: 0,
  totalSqFt: 0,
  totalOccupiedSqFt: 0,
};

interface _RentSummary {
  _summaryKey: string,

  count: number;
  totalMarketRent: number;

  totalOccupiedMarketRent: number;
  totalOccupiedInPlaceRent: number;
  occupiedCount: number;

  last30DaysCount: number;
  last30InPlaceRentTotal: number;

  last60DaysCount: number;
  last60InPlaceRentTotal: number;

  last90DaysCount: number;
  last90InPlaceRentTotal: number;

  leaseStartAndRents: {
    leaseStartDate: DateTime;
    inPlaceRent: number;
  }[];

  recent5Count: number;
  recent5InPlaceRentTotal: number;
}

export interface RentSummary {
  summaryKey: string;
  averageMarketRent: number;

  occupiedCount: number;
  occupiedAverageMarketRent: number;
  occupiedAverageInPlaceRent: number;
  occupiedInPlacePercentOfMarketRent: number;

  recent5Count: number;
  recent5AverageInPlaceRent: number;

  last30DaysCount: number;
  last30DaysAverageInPlaceRent: number;

  last60DaysCount: number;
  last60DaysAverageInPlaceRent: number;

  last90DaysCount: number;
  last90DaysAverageInPlaceRent: number;
}

const EmptyFPRentSummary: _RentSummary = {
  _summaryKey: '',
  count: 0,

  totalMarketRent: 0,

  totalOccupiedMarketRent: 0,
  totalOccupiedInPlaceRent: 0,
  occupiedCount: 0,

  last30DaysCount: 0,
  last30InPlaceRentTotal: 0,
  last60DaysCount: 0,
  last60InPlaceRentTotal: 0,
  last90DaysCount: 0,
  last90InPlaceRentTotal: 0,

  leaseStartAndRents: null,
  recent5Count: 0,
  recent5InPlaceRentTotal: 0,
};

interface _UnitSummary {
  _summaryKey: string;
  _sqFt: number;

  beds: string;
  baths: string;

  unitCount: number;

  occupiedCount: number;
  vacantCount: number;
  nonRevenueCount: number;

  renovatedCount: number;
  downCount: number;
  unRenovatedCount: number;
}

export interface UnitSummary {
  summaryKey: string;
  sqFt: number;

  beds: string;
  baths: string;

  unitCount: number;
  percentOfTotalUnits: number;

  percentOccupied: number;
  percentVacant: number;
  percentNonRevenue: number;

  countOccupied: number;
  countVacant: number;
  countNonRevenue: number;

  countRenovated: number;
  countDown: number;
  countUnRenovated: number;
}

const EmptyFPUnitSummary: _UnitSummary = {
  _summaryKey: '',
  _sqFt: 0,
  beds: '',
  baths: '',
  unitCount: 0,
  occupiedCount: 0,
  vacantCount: 0,
  nonRevenueCount: 0,
  renovatedCount: 0,
  downCount: 0,
  unRenovatedCount: 0,
};

type PreProcessedRRFDataRow = RRFDataRow & {
  __isOccupied: boolean;
  __isVacant: boolean;
  __isDown: boolean;
  __isNonRevenue: boolean;
  __leaseStart: DateTime;
  __inPlaceRent: number;
  __netEffectiveRent: number;
  __isResidential: boolean;
  __isRenovated: boolean;
}

interface SummaryPreProcessedRRFExtractedData extends Omit<RRFExtractedData, 'rows'> {
  rows: PreProcessedRRFDataRow[];
}


export class RentRollDataService extends Service {
  getRRColumnField(column: RRFDataColumn): RentRollFieldInterface | undefined {
    return RRUnitInformationField.get(column.name) ??
      RRLeaseTermsField.get(column.name) ??
      RRAdditionalField.get(column.name) ??
      RentRollFixedField.get(column.name) ??
      this.getChargeCodeField(column);
  }

  getChargeCodeField(column: RRFDataColumn): RentRollChargeCodeField | undefined {
    if (column.type === 'chargeCode') {
      return new RentRollChargeCodeField(column.name, column.header);
    }
    return undefined;
  }

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

  getOccupancyColumn(data: RRFExtractedData) {
    return data.columns.find(
      (column: RRFDataColumn) => column.name === RRUnitInformationField.status.key && !column.discard,
    );
  }

  getRenovatedColumn(data: RRFExtractedData) {
    return data.columns.find(
      (column: RRFDataColumn) => column.name === RentRollFixedField.Renovated.key,
    );
  }

  getAffordableColumn(data: RRFExtractedData) {
    return data.columns.find(
      (column: RRFDataColumn) => column.name === RentRollFixedField.Affordable.key,
    );
  }

  getMarketRentColumn(data: RRFExtractedData) {
    return data.columns.find(
      (column: RRFDataColumn) => column.name === RRUnitInformationField.marketRent.key && !column.discard,
    );
  }

  getSqFtColumn(data: RRFExtractedData) {
    return data.columns.find(
      (column: RRFDataColumn) => column.name === RRUnitInformationField.sqFt.key && !column.discard,
    );
  }

  getLeaseStartColumn(data: RRFExtractedData) {
    return data.columns.find(
      (column: RRFDataColumn) => column.name === RRLeaseTermsField.startDate.key && !column.discard,
    ) ?? data.columns.find(
      (column: RRFDataColumn) => column.name === RRLeaseTermsField.moveInDate.key && !column.discard,
    );
  }

  getLeaseEndColumn(data: RRFExtractedData) {
    return data.columns.find(
      (column: RRFDataColumn) => column.name === RRLeaseTermsField.endDate.key && !column.discard,
    ) ?? data.columns.find(
      (column: RRFDataColumn) => column.name === RRLeaseTermsField.moveOutDate.key && !column.discard,
    );
  }

  getChargeCodeColumns(data: RRFExtractedData): RRFDataColumn[] {
    return data.columns.filter((column) => {
      return (column as RRFDataColumn).type === 'chargeCode' && !(column as RRFDataColumn).discard;
    }) as RRFDataColumn[];
  }

  getChargeCodeSummary(data: RRFExtractedData): ChargeCodeSummary {
    const ccColumns = this.getChargeCodeColumns(data);
    const ccSummary: ChargeCodeSummary = {};

    ccColumns.forEach((column: RRFDataColumn) => {
      const total = data.rows
        .map((row: RRFDataRow) => this.getChargeCodeValue(row[column.key] as ChargeCodeValue))
        .reduce((sum, ccSumValue) => sum + ccSumValue, 0);
      ccSummary[column.name] = total;
    });

    return ccSummary;
  }

  getOccupancySummary(data: RRFExtractedData): OccupancySummary {
    const occupancySummary: OccupancySummary = {
      totalUnits: data.rows.length,
      summary: {},
    };

    const occupancyColumn = this.getOccupancyColumn(data);

    if (occupancyColumn) {
      occupancySummary.summary = data.rows
        .reduce((summary: OccupancySummary['summary'], row: RRFDataRow) => {
          const status = row[occupancyColumn.key] as string ?? '';
          if (status) {
            summary[status] = summary[status] ?? {
              count: 0,
            };
            summary[status].count += 1;
          }
          return summary;
        }, {});
    }

    return occupancySummary;
  }

  getFloorPlaColumn(data: RRFExtractedData) {
    return data.columns.find(
      (column: RRFDataColumn) => column.name === RRUnitInformationField.floorPlan.key && !column.discard,
    ) ?? data.columns.find(
      (column: RRFDataColumn) => column.name === RRUnitInformationField.unitType.key && !column.discard,
    ) ?? data.columns.find(
      (column: RRFDataColumn) => column.name === RRUnitInformationField.sqFt.key && !column.discard,
    );
  }

  getBedsColumn(data: RRFExtractedData) {
    return data.columns.find(
      (column: RRFDataColumn) => column.name === RRUnitInformationField.noOfBedrooms.key && !column.discard,
    );
  }

  getBathsColumn(data: RRFExtractedData) {
    return data.columns.find(
      (column: RRFDataColumn) => column.name === RRUnitInformationField.noOfBathrooms.key && !column.discard,
    );
  }

  getFPBedsBaths(data: RRFExtractedData): FPConfig {
    const floorPlanColumn = this.getFloorPlaColumn(data);
    const bedsColumn = this.getBedsColumn(data);
    const bathsColumn = this.getBathsColumn(data);
    const fpConfig: FPConfig = {};

    if (floorPlanColumn && (bedsColumn || bathsColumn)) {
      data.rows.forEach((row: RRFDataRow) => {
        const fp = row[floorPlanColumn.key] as string;
        if (!fpConfig[fp]) {
          const beds = bedsColumn ? row[bedsColumn.key] as string : '';
          const baths = bathsColumn ? row[bathsColumn.key] as string : '';
          fpConfig[fp] = {
            beds,
            baths,
            renameFloorPlan: '',
            tenantType: undefined,
          };
        }
      });
    }

    // Try with floor plan column
    if (floorPlanColumn) {
      data.rows.forEach((row: RRFDataRow) => {
        const fp = row[floorPlanColumn.key] as string;
        if (!fpConfig[fp] || Number(fpConfig[fp].beds) === 0) {
          fpConfig[fp] = getFpFloorPlan(fp);
        }
      });
    }
    return fpConfig;
  }

  getFPSqFtSummary(data: RRFExtractedData): FloorPlanSqFtSummary {
    const fpSqFtConfig: FloorPlanSqFtSummary = {};

    const sqFtColumn = data.columns.find(
      (column: RRFDataColumn) => column.name === RRUnitInformationField.sqFt.key && !column.discard,
    );

    const floorPlanColumn = this.getFloorPlaColumn(data);

    if (floorPlanColumn) {
      data.rows.forEach((row) => {
        const fpKey = floorPlanColumn.key;
        const fpValue = row[fpKey] as string;
        fpSqFtConfig[fpValue] = fpSqFtConfig[fpValue] ?? {
          totalSqFt: 0,
          unitsCount: 0,
          avgSqFt: 0,
        };

        fpSqFtConfig[fpValue].totalSqFt += Number(row[sqFtColumn?.key]) ?? 0;
        fpSqFtConfig[fpValue].unitsCount += 1;
      });

      Reflect.ownKeys(fpSqFtConfig).forEach((floorPlan: string) => {
        fpSqFtConfig[floorPlan].avgSqFt =
          Math.round(fpSqFtConfig[floorPlan].totalSqFt / fpSqFtConfig[floorPlan].unitsCount);
      });
    }
    return fpSqFtConfig;
  }

  getFloorPlanSummary(data: RRFExtractedData, occupancyConfig: OccupancyConfig): FloorPlanSummary {
    const floorPlanSummary: FloorPlanSummary = {
      floorPlanColumn: null,
      summary: {},
    };

    const floorPlanColumn = this.getFloorPlaColumn(data);

    const occupancyColumn = data.columns.find(
      (column: RRFDataColumn) => column.name === RRUnitInformationField.status.key && !column.discard,
    );

    const sqftColumn = data.columns.find(
      (column: RRFDataColumn) => column.name === RRUnitInformationField.sqFt.key && !column.discard,
    );

    if (floorPlanColumn) {
      floorPlanSummary.floorPlanColumn = this.getRRColumnField(floorPlanColumn as RRFDataColumn);
      floorPlanSummary.summary = data.rows.reduce((summary: FloorPlanSummary['summary'], row: RRFDataRow) => {
        const fp = row[floorPlanColumn.key] as string ?? '';

        summary[fp] = summary[fp] ?? {
          unitCount: 0,
          unitsOccupied: 0,
          averageSqFt: 0,
        };

        summary[fp].unitCount += 1;

        if (occupancyColumn) {
          if (occupancyConfig) {
            const occupancyValue = row[occupancyColumn.key] as string;
            const occupancyCode = occupancyConfig[occupancyValue];
            if (occupancyCode && RentRollOccupancyStatus.get(occupancyCode) === RentRollOccupancyStatus.Occupied) {
              summary[fp].unitsOccupied += 1;
            }
          } else {
            if (`${row[occupancyColumn.key]}`.toLowerCase().startsWith('oc')) {
              summary[fp].unitsOccupied += 1;
            }
          }
        }

        if (sqftColumn) {
          // Note: this is not average yet
          summary[fp].averageSqFt += parseNumeric(row[sqftColumn.key] as NumericValue);
        }

        return summary;
      }, {});
      Reflect.ownKeys(floorPlanSummary.summary).forEach((fp: string) => {
        const fpSummary = floorPlanSummary.summary[fp];
        if (fpSummary.unitCount) {
          fpSummary.averageSqFt = fpSummary.averageSqFt / fpSummary.unitCount;
        }
      });
    }

    return floorPlanSummary;
  }

  getColumnWiseSummary(data: RRFExtractedData): RRFDataRow[] {
    // @ts-ignore
    const summaryRow: RRFDataRow = {
      __isSummary: true,
    };
    for (const column of data.columns) {
      const field = this.getRRColumnField(column as RRFDataColumn);
      if (field) {
        if (field.options.summary === null) {
          summaryRow[column.key] = '';
        } else {
          const columnData = data.rows.map((row) => row[column.key]);
          if (field.options.summary === 'sum') {
            const total = columnData.reduce((sum: number, value) => {
              const v = typeof value === 'object' ?
                parseFloat(`${(value as ChargeCodeData).sum}`) :
                parseFloat(`${value}`);
              return isNaN(v) ? sum : sum + v;
            }, 0);
            summaryRow[column.key] = { total: total as number };
          } else if (field.options.summary === 'unique') {
            const uniqueCount = columnData.filter((v, i) => columnData.indexOf(v) === i).length;
            summaryRow[column.key] = { count: uniqueCount };
          }
        }
      }
    }
    return [summaryRow];
  }

  dataToSimpleJSON(data: RRFExtractedData) {
    const fieldTypeRow = [];
    const fieldNameRow = [];
    const headerNameRow = [];
    const dataRows = [];

    let firstRowProcessed = false;
    for (const row of data.rows) {
      const dataRow = [];

      for (const col of data.columns) {
        if ((col as RRFStaticColumn).isStatic) {
          if (!firstRowProcessed) {
            const sCol = col as RRFStaticColumn;
            fieldTypeRow.push(sCol.label);
            fieldNameRow.push('');
            headerNameRow.push('');
          }
          dataRow.push(row[col.key]);
        } else {
          const dCol = col as RRFDataColumn;
          if (!firstRowProcessed) {
            fieldTypeRow.push(dCol.type);
            fieldNameRow.push(dCol.name);
            if (dCol.type === 'chargeCode') {
              headerNameRow.push(dCol.header);
            } else {
              headerNameRow.push('');
            }
          }
          if (dCol.type === 'chargeCode') {
            const value = row[col.key] as ChargeCodeValue;
            const amount = typeof value === 'number' ? value : value?.sum;
            dataRow.push(amount);
          } else {
            dataRow.push(row[col.key]);
          }
        }
      }


      firstRowProcessed = true;
      dataRows.push(dataRow);
    }

    const jsonData: (string | number)[][] = [
      fieldTypeRow,
      fieldNameRow,
      headerNameRow,
      ...dataRows,
    ];

    return jsonData;
  }

  buildExportRRWorkbookData(columns: RRFColumn[], simpleJsonData: (string | number)[][]) {
    const headerMapObj: { [headerName: string]: { workbookName: string, subHeaderIndices: number[] } } = {
      'UNIT INFORMATION': { workbookName: 'unitInformation', subHeaderIndices: [] },
      'LEASE TERMS': { workbookName: 'leaseTerms', subHeaderIndices: [] },
      'TENANT CHARGES': { workbookName: 'chargeCode', subHeaderIndices: [] },
      'CONFIGURED': { workbookName: 'fixed', subHeaderIndices: [] },
      'ADDITIONAL DETAILS': { workbookName: 'additionalDetails', subHeaderIndices: [] },
    };

    const discardedColumns = columns.reduce((indices: number[], col: RRFDataColumn, idx: number) => {
      if (col.hasOwnProperty('discard') && col.discard) {
        indices.push(idx);
      }
      return indices;
    }, []);

    const sortedDataRows: (string | number | boolean)[][] = [];

    const sortedSubHeaderIndices = [];

    simpleJsonData[1].forEach((subHeader: string | number, idx: number) => {
      Reflect.ownKeys(headerMapObj).forEach((header: string) => {
        if (simpleJsonData[0][idx] === headerMapObj[header].workbookName) {
          headerMapObj[header].subHeaderIndices.push(idx);
        }
      });
    });


    Reflect.ownKeys(headerMapObj).forEach((header: string) => {
      sortedSubHeaderIndices.push(...headerMapObj[header].subHeaderIndices);
    });

    const discardedColumnIndices = sortedSubHeaderIndices.reduce((arr: number[], val: number, idx: number) => {
      if (discardedColumns.includes(val)) {
        arr.push(idx);
      }
      return arr;
    }, []);

    simpleJsonData.filter((data, idx) => idx > 2).forEach((data) => {
      const dataRow = [];
      Reflect.ownKeys(headerMapObj).forEach((header: string) => {
        headerMapObj[header].subHeaderIndices.forEach((idx) => {
          dataRow.push(data[idx] || '');
        });
      });
      sortedDataRows.push(dataRow);
    });

    const sheetsData: SheetsData = {
      RR_WORKBOOK: {
        RR_WB_TABLE: {
          data: sortedDataRows as any[][],
          freezeCell: `${toAlphabetColumnName(headerMapObj['UNIT INFORMATION'].subHeaderIndices.length + 1)}5`,
          allowFilter: true,
          hasSummaryRow: false,
          applyDefaultStyling: true,
          discardedColumnIndices,
          header: Reflect.ownKeys(headerMapObj).map((headerName: string) => ({
            name: headerName,
            mergeColCount: headerMapObj[headerName].subHeaderIndices.length,
          })),
          subHeader: sortedSubHeaderIndices.map((sHIndex: number) => {
            const subHeaderName = simpleJsonData[1][sHIndex].toString().replaceAll('_', ' ');
            return subHeaderName.toLowerCase().split(' ')
              .map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
          }),
        },
      },
    };

    return sheetsData;
  }

  prepareRenovatedStatus(data: RRFExtractedData, config: RenovationConfiguration) {
    if (config.hasRenovation) {
      const renovationKeys = Reflect.ownKeys(config.renovationConfig);
      if (config.renovationBasis === 'charge-code') {
        // charge code columns to use for renovation status
        const usedChargeCodeColumns = data.columns
          .filter((col: RRFDataColumn) => col.type === 'chargeCode')
          .filter((col: RRFDataColumn) => renovationKeys.some(
            (chargeCode: string) => col.name === chargeCode && config.renovationConfig[chargeCode] === true),
          );
        // for each row set to true if any of the selected column has a positive value
        return data.rows.map(
          (row: RRFDataRow) => usedChargeCodeColumns.some((col: RRFDataColumn) => row[col.key] ?? 0 > 0),
        );
      } else {
        const floorPlanColumn = this.getFloorPlaColumn(data);
        return data.rows.map(
          (row: RRFDataRow) => renovationKeys.some(
            (floorPlan: string) =>
              row[floorPlanColumn?.key] === floorPlan && config.renovationConfig[floorPlan] === true,
          ),
        );
      }
    } else {
      return new Array(data.rows.length).fill(false);
    }
    return new Array(data.rows.length).fill(false);
  }

  prepareAffordableStatus(data: RRFExtractedData, config: AffordableConfiguration) {
    if (config.hasAffordable) {
      const affordableKeys = Reflect.ownKeys(config.affordableConfig);
      if (config.affordableBasis === 'charge-code') {
        const usedChargeCodeColumns = data.columns
          .filter((col: RRFDataColumn) => col.type === 'chargeCode')
          .filter((col: RRFDataColumn) => affordableKeys.some(
            (chargeCode: string) => col.name === chargeCode && config.affordableConfig[chargeCode]),
          );
        return data.rows.map(
          (row: RRFDataRow) => {
            const foundCC = usedChargeCodeColumns.filter((col) => row.hasOwnProperty(col.key));
            if (!!foundCC.length) {
              return config.affordableConfig[foundCC[0].name];
            }
            return AffordableLeaseTypes.Market.key;
          },
        );
      } else {
        const floorPlanColumn = this.getFloorPlaColumn(data);
        return data.rows.map(
          (row: RRFDataRow) => {
            const fpKey = affordableKeys.some(
              (floorPlan: string) =>
                row[floorPlanColumn?.key] === floorPlan && config.affordableConfig[floorPlan],
            );
            return fpKey ?
              config.affordableConfig[row[floorPlanColumn.key] as string] :
              AffordableLeaseTypes.Market.key;
          },
        );
      }
    } else {
      return new Array(data.rows.length).fill(AffordableLeaseTypes.Market.key);
    }
    return new Array(data.rows.length).fill(AffordableLeaseTypes.Market.key);
  }

  prepareMtmStatus(data: RRFExtractedData, config: MtmConfiguration, asOnDate: string) {
    if (config.hasMtm) {
      const mtmKeys = Reflect.ownKeys(config.mtmConfig);
      if (config.mtmBasis === 'charge-code') {
        // charge code columns to use for mtm status
        const usedChargeCodeColumns = data.columns
          .filter((col: RRFDataColumn) => col.type === 'chargeCode')
          .filter((col: RRFDataColumn) => mtmKeys.some(
            (chargeCode: string) => col.name === chargeCode && config.mtmConfig[chargeCode] === true),
          );
        // for each row set to true if any of the selected column has a positive value
        return data.rows.map(
          (row: RRFDataRow) => usedChargeCodeColumns.some((col: RRFDataColumn) => row[col.key] ?? 0 > 0),
        );
      } else if (config.mtmBasis === 'as-on-date') {
        const leaseEndColumn = this.getLeaseEndColumn(data);
        if (leaseEndColumn) {
          const asOnDateTime = DateTime.fromISO(asOnDate);
          return data.rows.map(
            (row: RRFDataRow) => row[leaseEndColumn.key] ?
              Number(DateTime.fromFormat(row[leaseEndColumn.key] as string, 'MM/dd/yyyy')) < Number(asOnDateTime) :
              false,
          );
        }
      }
    } else {
      return new Array(data.rows.length).fill(false);
    }
    return new Array(data.rows.length).fill(false);
  }

  getBedsChartSummary(data: RRFExtractedData, fpConfig: FPConfig): RRBedsUnitCountSummary {
    const bedsUnitCount: RRBedsUnitCountSummary = { unknown: 0 };
    if (data && fpConfig) {
      const floorPlanColumn = this.getFloorPlaColumn(data);
      if (floorPlanColumn) {
        data.rows.forEach((rowData: RRFDataRow) => {
          const fp = rowData[floorPlanColumn.key] as string;
          const bedsCount = fpConfig[fp]?.beds || 'unknown';
          bedsUnitCount[bedsCount] = (bedsUnitCount[bedsCount] ?? 0) + 1;
        });
      }
    }
    return bedsUnitCount;
  }

  getOccupancyChartSummary(data: RRFExtractedData, occupancyConfig: OccupancyConfig): OccupancyChartSummary {
    const chartSummary: OccupancyChartSummary = { unknown: 0 };

    if (data && occupancyConfig) {
      const occupancyColumn = this.getOccupancyColumn(data);

      if (occupancyColumn) {
        data.rows.forEach((rowData: RRFDataRow) => {
          const occupancyValue = rowData[occupancyColumn.key] as string;
          const occupancy = occupancyConfig[occupancyValue] || 'unknown';
          chartSummary[occupancy] = (chartSummary[occupancy] ?? 0) + 1;
        });
      }
    }

    return chartSummary;
  }

  getRenovatedChartSummary(data: RRFExtractedData): RenovatedChartSummary {
    const chartSummary: RenovatedChartSummary = {
      'Renovated': 0,
      'Non-Renovated': 0,
      'unknown': 0,
    };

    if (data) {
      const renovatedColumn = this.getRenovatedColumn(data);
      data.rows.forEach((rowData: RRFDataRow) => {
        const renovated = rowData[renovatedColumn.key];

        if (renovated === true || renovated === 'Yes') {
          chartSummary.Renovated += 1;
        } else if (renovated === false || renovated === 'No') {
          chartSummary['Non-Renovated'] += 1;
        } else {
          chartSummary.unknown += 1;
        }
      });
    }

    return chartSummary;
  }

  getNewLeasesChartSummary(data: RRFExtractedData): NewLeasesChartSummary {
    const chartSummary: NewLeasesChartSummary = { unknown: 0 };

    if (data) {
      const leaseStartColumn = this.getLeaseStartColumn(data);

      if (leaseStartColumn) {
        data.rows.forEach((rowData: RRFDataRow) => {
          const date = rowData[leaseStartColumn.key] as string;
          if (date) {
            const isoDate = mmddyyyyToISO(date, true);
            if (isoDate) {
              const isoMonth = isoDate.substring(0, 7);
              chartSummary[isoMonth] = (chartSummary[isoMonth] ?? 0) + 1;
            } else {
              chartSummary.unknown += 1;
            }
          } else {
            chartSummary.unknown += 1;
          }
        });
      }
    }

    return chartSummary;
  }

  getAffordableChartSummary(data: RRFExtractedData): AffordableChartSummary {
    const chartSummary: AffordableChartSummary = {
      'Market': 0,
      'Affordable': 0,
      'Section 8': 0,
      'Rent Controlled': 0,
      'Other': 0,
    };

    if (data) {
      const affordableColumn = this.getAffordableColumn(data);

      data.rows.forEach((rowData: RRFDataRow) => {
        const affordableValue = rowData[affordableColumn.key] as string || 'Other';
        chartSummary[affordableValue] += 1;
      });
    }

    return chartSummary;
  }

  getChargeCodeChartSummary(data: RRFExtractedData, chargeCodeConfig: ChargeCodeConfig): ChargeCodeChartSummary {
    const chartSummary: ChargeCodeChartSummary = { unknown: 0 };

    if (data && chargeCodeConfig) {
      const ccColumns = this.getChargeCodeColumns(data);

      data.rows.forEach((rowData: RRFDataRow) => {
        ccColumns.forEach((ccColumn: RRFDataColumn) => {
          const chargeCodeValue = this.getChargeCodeValue(rowData[ccColumn.key] as ChargeCodeValue);
          const chargeCode = chargeCodeConfig[ccColumn.name] || 'unknown';
          chartSummary[chargeCode] = (chartSummary[chargeCode] ?? 0) + chargeCodeValue;
        });
      });
    }

    return chartSummary;
  }

  isOccupied(occupancyConfig: OccupancyConfig, occupancy) {
    const occupancyCode = RentRollOccupancyStatus.get(occupancyConfig[occupancy]);
    return occupancyCode === RentRollOccupancyStatus.Occupied;
  }

  isVacant(occupancyConfig: OccupancyConfig, occupancy) {
    const occupancyCode = RentRollOccupancyStatus.get(occupancyConfig[occupancy]);
    return occupancyCode === RentRollOccupancyStatus.Vacant;
  }

  isDown(occupancyConfig: OccupancyConfig, occupancy) {
    const occupancyCode = RentRollOccupancyStatus.get(occupancyConfig[occupancy]);
    return occupancyCode === RentRollOccupancyStatus.Down;
  }

  isNonRevenue(occupancyConfig: OccupancyConfig, occupancy) {
    const occupancyCode = RentRollOccupancyStatus.get(occupancyConfig[occupancy]);
    return occupancyCode === RentRollOccupancyStatus.Admin ||
      occupancyCode === RentRollOccupancyStatus.Down ||
      occupancyCode === RentRollOccupancyStatus.Model ||
      occupancyCode === RentRollOccupancyStatus.Office;
  }

  private preProcessDataForSummary(
    data: RRFExtractedData,
    occupancyConfig: OccupancyConfig,
    chargeCodeConfig: ChargeCodeConfig,
    fpConfig: FPConfig,
    fpColumn: RRFColumn,
  ): SummaryPreProcessedRRFExtractedData {
    const occupancyColumn = this.getOccupancyColumn(data);
    const leaseStartColumn = this.getLeaseStartColumn(data);
    const monthlyRentColumns = this.getMonthlyRentColumns(data, chargeCodeConfig);
    const renovatedColumn = this.getRenovatedColumn(data);
    const chargeCodeColumns = this.getChargeCodeColumns(data);


    const preProcessedData: SummaryPreProcessedRRFExtractedData = {
      ...data,
      rows: data.rows.map((row: RRFDataRow) => {
        const renovated = row[renovatedColumn.key];
        // @ts-ignore
        const preProcessedRow: PreProcessedRRFDataRow = {
          ...row,
          __isOccupied: !occupancyColumn || this.isOccupied(occupancyConfig, row[occupancyColumn.key]),
          __isVacant: !occupancyColumn || this.isVacant(occupancyConfig, row[occupancyColumn.key]),
          __isDown: !occupancyColumn || this.isDown(occupancyConfig, row[occupancyColumn.key]),
          __isNonRevenue: !occupancyColumn || this.isNonRevenue(occupancyConfig, row[occupancyColumn.key]),
          __leaseStart: leaseStartColumn ?
            row[leaseStartColumn.key] ?
              DateTime.fromFormat(row[leaseStartColumn.key] as string, 'M/d/yyyy') :
              null :
            null,
          __inPlaceRent: this.getMonthlyRent(row, monthlyRentColumns),
          __netEffectiveRent: this.getMonthlyRent(row, chargeCodeColumns),
          __isResidential: !fpColumn || fpConfig[row[fpColumn.key] as string]?.tenantType !== 'Commercial',
          __isRenovated: renovated === true || renovated === 'Yes',
        };
        return preProcessedRow;
      }),
    };
    return preProcessedData;
  }

  getMonthlyRentColumns(data: RRFExtractedData, chargeCodeConfig: ChargeCodeConfig): RRFDataColumn[] {
    const ccColumns = this.getChargeCodeColumns(data);

    const monthlyRentCCColumns = ccColumns
      .filter((col: RRFDataColumn) => chargeCodeConfig?.[col.name] === RentRollChargeCode.MonthlyRent.key);

    const monthlyRentColumn = data.columns.find(
      (column: RRFDataColumn) =>
        column.type !== 'chargeCode' && column.name === RRAdditionalField.monthlyRent.key && !column.discard,
    ) as RRFDataColumn;

    return monthlyRentColumn ? [...monthlyRentCCColumns, monthlyRentColumn] : monthlyRentCCColumns;
  }

  getMonthlyRent(row: RRFDataRow, monthlyRentColumns: RRFDataColumn[]) {
    return monthlyRentColumns.reduce((total: number, column: RRFDataColumn) => {
      // Maybe a charge code column or a normal column. getChargeCodeValue should handle both
      const value = this.getChargeCodeValue(row[column.key] as ChargeCodeValue);
      return total + value;
    }, 0);
  }

  getRentRollComps(
    documentsData: DocumentData[],
    { fpConfigs, chargeCodeConfigs, occupancyConfigs }:
      {
        fpConfigs: FPConfig[],
        occupancyConfigs: OccupancyConfig[],
        chargeCodeConfigs: ChargeCodeConfig[],
      },
    { bedsType }: { bedsType: BedsType },
  ) {
    const summaries: CompSummary[] = [];
    for (let i = 0; i < documentsData.length; i++) {
      const data = documentsData[i].editedData as RRFExtractedData;
      const fpColumn = this.getFloorPlaColumn(data);
      const preProcessedData = this.preProcessDataForSummary(
        data, occupancyConfigs[i], chargeCodeConfigs[i], fpConfigs[i], fpColumn,
      );

      summaries[i] = this.getCompsSummary(
        preProcessedData,
        fpConfigs[i],
        (row: PreProcessedRRFDataRow) => {
          const fp = row[fpColumn.key] as string;
          const beds = fpConfigs[i][fp]?.beds;
          const baths = fpConfigs[i][fp]?.baths;
          return bedsType === 'beds' ?
            (beds !== 'studio' ? `${beds} Beds` : 'Studio') :
            (beds !== 'studio' ? `${beds} Beds - ${baths} Baths` : 'Studio');
        },
      );
    }
    return summaries;
  }

  getCompsSummary(
    preProcessedData: SummaryPreProcessedRRFExtractedData,
    fpConfig: FPConfig,
    getSummaryKey: (row: PreProcessedRRFDataRow) => string,
  ): CompSummary {
    const compsSummary: Record<string, _CompSummary> = {};
    const marketRentColumn = this.getMarketRentColumn(preProcessedData);
    const sqFtColumn = this.getSqFtColumn(preProcessedData);

    let totalUnitsCount = 0;
    let totalOccupiedUnits = 0;

    let totalMarketRent = 0;
    let totalOccupiedUnitsMarketRent = 0;

    let totalNetEffectiveRent = 0;
    let totalOccupiedNetEffectiveRent = 0;

    let totalMonthlyRent = 0;
    let totalOccupiedMonthlyRent = 0;

    let totalSqFt = 0;
    let totalOccupiedSqFt = 0;

    preProcessedData.rows.forEach((row: PreProcessedRRFDataRow) => {
      if (row.__isResidential) {
        const summaryKey = getSummaryKey(row);

        compsSummary[summaryKey] = compsSummary[summaryKey] ?? {
          ...EmptyCompsSummary,
          _summaryKey: summaryKey,
        };

        compsSummary[summaryKey].count += 1;
        totalUnitsCount += 1;

        let marketRent = marketRentColumn ? parseFloat(row[marketRentColumn.key] as string) : 0;
        if (isNaN(marketRent)) {
          marketRent = 0;
        }
        compsSummary[summaryKey].totalMarketRent += marketRent;
        totalMarketRent += marketRent;

        totalNetEffectiveRent += row.__netEffectiveRent;
        compsSummary[summaryKey].totalNetEffectiveRent += row.__netEffectiveRent;

        totalMonthlyRent += row.__inPlaceRent;
        compsSummary[summaryKey].totalMonthlyRent += row.__inPlaceRent;

        const sqFt = sqFtColumn ? row[sqFtColumn.key] as number ?? 0 : 0;
        totalSqFt += parseNumeric(sqFt);
        compsSummary[summaryKey].totalSqFt += parseNumeric(sqFt);

        if (row.__isOccupied) {
          compsSummary[summaryKey].occupiedCount += 1;
          totalOccupiedUnits += 1;

          totalOccupiedUnitsMarketRent += marketRent;
          compsSummary[summaryKey].totalOccupiedMarketRent += marketRent;

          compsSummary[summaryKey].totalOccupiedNetEffectiveRent += row.__netEffectiveRent;
          totalOccupiedNetEffectiveRent += row.__netEffectiveRent;

          compsSummary[summaryKey].totalOccupiedMonthlyRent += row.__inPlaceRent;
          totalOccupiedMonthlyRent += row.__inPlaceRent;

          compsSummary[summaryKey].totalOccupiedSqFt += sqFt;
          totalOccupiedSqFt += sqFt;
        }
      }
    });

    return {
      compsSummary,
      totalUnitsCount,
      totalOccupiedUnits,
      totalMarketRent,
      totalOccupiedUnitsMarketRent,
      totalNetEffectiveRent,
      totalOccupiedNetEffectiveRent,
      totalMonthlyRent,
      totalOccupiedMonthlyRent,
      totalSqFt,
      totalOccupiedSqFt,
    };
  }


  getValidatedSummary(
    data: RRFExtractedData,
    fpConfig: FPConfig,
    occupancyConfig: OccupancyConfig,
    chargeCodeConfig: ChargeCodeConfig,
    asOnDate: string,
  ) {
    let fpRentSummary: RentSummary[] = [];
    let fpRentSummarySummary: Partial<RentSummary> = {};
    let fpUnitSummary: UnitSummary[] = [];
    let fpUnitSummarySummary: Partial<UnitSummary> = {};

    let bedsRentSummary: RentSummary[] = [];
    let bedsRentSummarySummary: Partial<RentSummary> = {};
    let bedsUnitSummary: UnitSummary[] = [];
    let bedsUnitSummarySummary: Partial<UnitSummary> = {};

    let fpNameRentSummary: RentSummary[] = [];
    let fpNameRentSummarySummary: Partial<RentSummary> = {};
    let fpNameUnitSummary: UnitSummary[] = [];
    let fpNameUnitSummarySummary: Partial<UnitSummary> = {};

    let sqFtRentSummary: RentSummary[] = [];
    let sqFtRentSummarySummary: Partial<RentSummary> = {};
    let sqFtUnitSummary: UnitSummary[] = [];
    let sqFtUnitSummarySummary: Partial<UnitSummary> = {};

    if (data && occupancyConfig && chargeCodeConfig && fpConfig) {
      const fpColumn = this.getFloorPlaColumn(data);
      const preProcessedData = this.preProcessDataForSummary(
        data, occupancyConfig, chargeCodeConfig, fpConfig, fpColumn,
      );
      const sqFtColumn = this.getSqFtColumn(data);

      if (fpColumn) {
        const fpRentSummaryData = this.getRentSummary(
          preProcessedData, fpConfig, asOnDate, (row: PreProcessedRRFDataRow) => row[fpColumn.key] as string,
        );
        fpRentSummary = fpRentSummaryData.finalRentSummary;
        fpRentSummarySummary = fpRentSummaryData.summaryRow;
        const fpUnitSummaryData = this.getUnitSummary(
          preProcessedData, fpConfig, (row: PreProcessedRRFDataRow) => row[fpColumn.key] as string,
        );
        fpUnitSummary = fpUnitSummaryData.finalUnitSummary;
        fpUnitSummarySummary = fpUnitSummaryData.summaryRow;

        const bedsRentSummaryData = this.getRentSummary(
          preProcessedData, fpConfig, asOnDate, (row: PreProcessedRRFDataRow) => {
            const fp = row[fpColumn.key] as string;
            const beds = fpConfig[fp]?.beds;
            return beds !== 'studio' ? `${beds} Beds` : 'Studio';
          },
        );
        bedsRentSummary = bedsRentSummaryData.finalRentSummary;
        bedsRentSummarySummary = bedsRentSummaryData.summaryRow;
        const bedsUnitSummaryData = this.getUnitSummary(
          preProcessedData, fpConfig, (row: PreProcessedRRFDataRow) => {
            const fp = row[fpColumn.key] as string;
            const beds = fpConfig[fp]?.beds;
            return beds !== 'studio' ? `${beds} Beds` : 'Studio';
          },
        );
        bedsUnitSummary = bedsUnitSummaryData.finalUnitSummary;
        bedsUnitSummarySummary = bedsUnitSummaryData.summaryRow;

        const fpNameRentSummaryData = this.getRentSummary(
          preProcessedData, fpConfig, asOnDate, (row: PreProcessedRRFDataRow) => {
            const fp = row[fpColumn.key] as string;
            return fpConfig[fp]?.renameFloorPlan || fp;
          },
        );
        fpNameRentSummary = fpNameRentSummaryData.finalRentSummary;
        fpNameRentSummarySummary = fpNameRentSummaryData.summaryRow;
        const fpNameUnitSummaryData = this.getUnitSummary(
          preProcessedData, fpConfig, (row: PreProcessedRRFDataRow) => {
            const fp = row[fpColumn.key] as string;
            return fpConfig[fp]?.renameFloorPlan || fp;
          },
        );
        fpNameUnitSummary = fpNameUnitSummaryData.finalUnitSummary;
        fpNameUnitSummarySummary = fpNameUnitSummaryData.summaryRow;
      }

      if (sqFtColumn) {
        const sqFtRentSummaryData = this.getRentSummary(
          preProcessedData, fpConfig, asOnDate, (row: PreProcessedRRFDataRow) => row[sqFtColumn.key] as string,
        );
        sqFtRentSummary = sqFtRentSummaryData.finalRentSummary;
        sqFtRentSummarySummary = sqFtRentSummaryData.summaryRow;
        const sqFtUnitSummaryData = this.getUnitSummary(
          preProcessedData, fpConfig, (row: PreProcessedRRFDataRow) => row[sqFtColumn.key] as string,
        );
        sqFtUnitSummary = sqFtUnitSummaryData.finalUnitSummary;
        sqFtUnitSummarySummary = sqFtUnitSummaryData.summaryRow;
      }
    }

    return {
      fpRentSummary, fpUnitSummary, fpRentSummarySummary, fpUnitSummarySummary,
      bedsRentSummary, bedsUnitSummary, bedsRentSummarySummary, bedsUnitSummarySummary,
      sqFtRentSummary, sqFtUnitSummary, fpNameRentSummarySummary, fpNameUnitSummarySummary,
      fpNameRentSummary, fpNameUnitSummary, sqFtRentSummarySummary, sqFtUnitSummarySummary,
    };
  }

  getUnitSummary(
    preProcessedData: SummaryPreProcessedRRFExtractedData,
    fpConfig: FPConfig,
    getSummaryKey: (row: PreProcessedRRFDataRow) => string,
  ) {
    const unitSummary: Record<string, _UnitSummary> = {};
    const fpColumn = this.getFloorPlaColumn(preProcessedData);
    const sqFtColumn = this.getSqFtColumn(preProcessedData);
    const residentialCount = preProcessedData.rows.filter((r: PreProcessedRRFDataRow) => r.__isResidential).length || 1;

    if (preProcessedData) {
      preProcessedData.rows.forEach((row: PreProcessedRRFDataRow) => {
        const summaryKey = getSummaryKey(row);

        if (row.__isResidential) {
          const sqFt = sqFtColumn ? row[sqFtColumn.key] as number ?? 0 : 0;
          const summarySqFtKey = `${summaryKey}_|_${sqFt}`;
          const fp = row[fpColumn.key] as string;

          unitSummary[summarySqFtKey] = unitSummary[summarySqFtKey] ?? {
            ...EmptyFPUnitSummary,
            _summaryKey: summaryKey,
            _sqFt: sqFt,
            beds: fpConfig[fp]?.beds,
            baths: fpConfig[fp]?.baths,
          };

          unitSummary[summarySqFtKey].unitCount += 1;

          if (row.__isOccupied) {
            unitSummary[summarySqFtKey].occupiedCount += 1;
          }
          if (row.__isVacant) {
            unitSummary[summarySqFtKey].vacantCount += 1;
          }
          if (row.__isNonRevenue) {
            unitSummary[summarySqFtKey].nonRevenueCount += 1;
          }
          if (row.__isDown) {
            unitSummary[summarySqFtKey].downCount += 1;
          }
          if (row.__isRenovated) {
            unitSummary[summarySqFtKey].renovatedCount += 1;
          }
        }
      });
    }

    const finalUnitSummary = Reflect.ownKeys(unitSummary).map((key: string) => {
      return {
        summaryKey: unitSummary[key]._summaryKey,
        sqFt: unitSummary[key]._sqFt,

        beds: unitSummary[key].beds,
        baths: unitSummary[key].baths,

        unitCount: unitSummary[key].unitCount,
        percentOfTotalUnits: (unitSummary[key].unitCount) / residentialCount,

        percentOccupied: (unitSummary[key].occupiedCount) / (unitSummary[key].unitCount || 1),
        percentVacant: (unitSummary[key].vacantCount) / (unitSummary[key].unitCount || 1),
        percentNonRevenue: (unitSummary[key].nonRevenueCount) / (unitSummary[key].unitCount || 1),

        countOccupied: unitSummary[key].occupiedCount,
        countVacant: unitSummary[key].vacantCount,
        countNonRevenue: unitSummary[key].nonRevenueCount,

        countDown: unitSummary[key].downCount,
        countRenovated: unitSummary[key].renovatedCount,
        countUnRenovated: unitSummary[key].unitCount - unitSummary[key].renovatedCount - unitSummary[key].downCount,
      } as UnitSummary;
    });

    let summarySqFtTotal: number = 0;
    const summaryRow = finalUnitSummary.reduce((obj, summary) => {
      obj.unitCount += summary.unitCount;
      obj.countVacant += summary.countVacant;
      obj.countOccupied += summary.countOccupied;
      obj.countNonRevenue += summary.countNonRevenue;
      obj.percentOfTotalUnits += summary.percentOfTotalUnits;
      obj.countDown += summary.countDown;
      obj.countRenovated += summary.countRenovated;
      obj.countUnRenovated += summary.countUnRenovated;
      summarySqFtTotal += Number(summary.sqFt) * Number(summary.unitCount);
      return obj;
    }, {
      summaryKey: 'Totals / Avg',
      sqFt: 0,
      unitCount: 0,
      countVacant: 0,
      countOccupied: 0,
      countNonRevenue: 0,
      percentOfTotalUnits: 0,
      percentOccupied: 0,
      percentVacant: 0,
      percentNonRevenue: 0,
      countDown: 0,
      countRenovated: 0,
      countUnRenovated: 0,
    });

    summaryRow.sqFt = Number((summarySqFtTotal / (summaryRow.unitCount || 1)).toFixed(2));
    summaryRow.percentOccupied = (summaryRow.countOccupied) / (summaryRow.unitCount || 1);
    summaryRow.percentVacant = (summaryRow.countVacant) / (summaryRow.unitCount || 1);
    summaryRow.percentNonRevenue = (summaryRow.countNonRevenue) / (summaryRow.unitCount || 1);
    return { finalUnitSummary, summaryRow };
  }

  getRentSummary(
    preProcessedData: SummaryPreProcessedRRFExtractedData,
    fpConfig: FPConfig,
    asOnDate: string,
    getSummaryKey: (row: PreProcessedRRFDataRow) => string,
  ) {
    const rentSummary: Record<string, _RentSummary> = {};
    const marketRentColumn = this.getMarketRentColumn(preProcessedData);
    const _asOnDate = DateTime.fromISO(asOnDate);

    let totalMarketRent = 0;
    let totalUnitsCount = 0;

    let totalOccupiedUnits = 0;
    let totalOccupiedUnitsRent = 0;
    let totalOccupiedUnitsMarketRent = 0;

    if (preProcessedData) {
      preProcessedData.rows.forEach((row: PreProcessedRRFDataRow) => {
        if (row.__isResidential) {
          const summaryKey = getSummaryKey(row);
          rentSummary[summaryKey] = rentSummary[summaryKey] ?? {
            ...EmptyFPRentSummary,
            _summaryKey: summaryKey,
            leaseStartAndRents: [],
          };
          rentSummary[summaryKey].count += 1;
          totalUnitsCount += 1;
          let marketRent = marketRentColumn ? parseFloat(row[marketRentColumn.key] as string) : 0;
          if (isNaN(marketRent)) {
            marketRent = 0;
          }

          if (marketRentColumn) {
            rentSummary[summaryKey].totalMarketRent += marketRent;
            totalMarketRent += marketRent;
          }

          if (row.__isOccupied) {
            rentSummary[summaryKey].occupiedCount += 1;
            rentSummary[summaryKey].totalOccupiedMarketRent += marketRent;
            rentSummary[summaryKey].totalOccupiedInPlaceRent += row.__inPlaceRent;

            totalOccupiedUnits += 1;
            totalOccupiedUnitsRent += row.__inPlaceRent;
            totalOccupiedUnitsMarketRent += marketRent;
          }

          if (row.__leaseStart) {
            rentSummary[summaryKey].leaseStartAndRents.push({
              leaseStartDate: row.__leaseStart,
              inPlaceRent: row.__inPlaceRent,
            });

            const { days } = _asOnDate.diff(row.__leaseStart, 'days').toObject();

            if (days <= 30) {
              rentSummary[summaryKey].last30DaysCount += 1;
              rentSummary[summaryKey].last30InPlaceRentTotal += row.__inPlaceRent;
            }
            if (days <= 60) {
              rentSummary[summaryKey].last60DaysCount += 1;
              rentSummary[summaryKey].last60InPlaceRentTotal += row.__inPlaceRent;
            }
            if (days <= 90) {
              rentSummary[summaryKey].last90DaysCount += 1;
              rentSummary[summaryKey].last90InPlaceRentTotal += row.__inPlaceRent;
            }
          }
        }
      });

      Reflect.ownKeys(rentSummary).forEach((fp: string) => {
        const leaseStartAndRents = rentSummary[fp].leaseStartAndRents.sort((a, b) => {
          return Number(a.leaseStartDate) - Number(b.leaseStartDate);
        }).slice(-5);
        rentSummary[fp].recent5Count = leaseStartAndRents.length;
        rentSummary[fp].recent5InPlaceRentTotal = leaseStartAndRents.reduce(
          (total, lar) => total + lar.inPlaceRent, 0,
        );
      });
    }

    let occupiedTotalMarketRent = 0;
    let occupiedTotalInPlaceRent = 0;
    const finalRentSummary = Reflect.ownKeys(rentSummary).map((sk: string) => {
      const averageMarketRent = rentSummary[sk].totalMarketRent / (rentSummary[sk].count || 1);
      const occupiedAverageMarketRent = rentSummary[sk].totalOccupiedMarketRent / (rentSummary[sk].occupiedCount || 1);
      const occupiedAverageInPlaceRent =
        rentSummary[sk].totalOccupiedInPlaceRent / (rentSummary[sk].occupiedCount || 1);

      occupiedTotalMarketRent += Number(occupiedAverageMarketRent * rentSummary[sk].occupiedCount);
      occupiedTotalInPlaceRent += Number(occupiedAverageInPlaceRent * rentSummary[sk].occupiedCount);

      return {
        summaryKey: sk,
        averageMarketRent,

        occupiedCount: rentSummary[sk].occupiedCount,

        occupiedAverageMarketRent,
        occupiedAverageInPlaceRent,
        occupiedInPlacePercentOfMarketRent: occupiedAverageMarketRent > 0 ?
          (occupiedAverageInPlaceRent) / (occupiedAverageMarketRent) : NaN,

        recent5Count: rentSummary[sk].recent5Count,
        recent5AverageInPlaceRent: rentSummary[sk].recent5InPlaceRentTotal / (rentSummary[sk].recent5Count || 1),

        last30DaysCount: rentSummary[sk].last30DaysCount,
        last30DaysAverageInPlaceRent: rentSummary[sk].last30InPlaceRentTotal / (rentSummary[sk].last30DaysCount || 1),

        last60DaysCount: rentSummary[sk].last60DaysCount,
        last60DaysAverageInPlaceRent: rentSummary[sk].last60InPlaceRentTotal / (rentSummary[sk].last60DaysCount || 1),

        last90DaysCount: rentSummary[sk].last90DaysCount,
        last90DaysAverageInPlaceRent: rentSummary[sk].last90InPlaceRentTotal / (rentSummary[sk].last90DaysCount || 1),
      } as RentSummary;
    });

    const summaryRow = {
      summaryKey: 'Totals / Avg',
      occupiedCount: totalOccupiedUnits,
      averageMarketRent: totalMarketRent / (totalUnitsCount || 1),
      occupiedAverageMarketRent: occupiedTotalMarketRent / (totalOccupiedUnits || 1),
      occupiedAverageInPlaceRent: occupiedTotalInPlaceRent / (totalOccupiedUnits || 1),
      occupiedInPlacePercentOfMarketRent:
        totalOccupiedUnitsMarketRent > 0 ?
          (totalOccupiedUnitsRent / (totalOccupiedUnits || 1)) /
          (totalOccupiedUnitsMarketRent / (totalOccupiedUnits || 1)) :
          NaN,
    };
    return { finalRentSummary, summaryRow };
  }

  checkColumnValue(column: RRFColumn, value: any) {
    let validValue = true;
    const field = this.getRRColumnField(column as RRFDataColumn);
    if (!!value) {
      if (['amount', 'amount_psf', 'number'].includes(field?.options?.type)) {
        if (isNaN(Number(value))) {
          validValue = false;
        }
      } else if (field?.options?.type === 'date') {
        const dateTime = DateTime.fromFormat(value, 'mm/dd/yyyy');
        if (!dateTime.isValid) {
          validValue = false;
        }
      } else if (field?.options?.type === 'bool' && !['Yes', 'No'].includes(value)) {
        validValue = false;
      } else if (field?.options?.type === 'enum' &&
        !field?.options?.enumType.all().map((k) => k.key).includes(value)) {
        validValue = false;
      }
    }
    return validValue;
  }
}

export const useRentRollDataService: () => RentRollDataService = () => RentRollDataService.useService();
