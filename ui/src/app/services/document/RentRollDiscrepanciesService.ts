import { DateTime } from 'luxon';
import { Service } from '../../../bootstrap/service/Service';
import {
  ChargeCodeConfig,
  OccupancyConfig, RRDiscrepancies,
  RRFDataColumn,
  RRFDataRow,
  RRFExtractedData,
} from '../../../types';
import { RRLeaseTermsField, RRUnitInformationField } from '../../enums/RentRollFieldEnum';
import { RentRollChargeCode } from '../../enums/RentRollChargeCode';
import { RentRollOccupancyStatus } from '../../enums/RentRollOccupancyStatus';
import { getRowMonthlyRent } from '../../components/app/deal/document/rentroll/editor/utils';


export class RentRollDiscrepanciesService extends Service {
  private discrepancies: RRDiscrepancies;

  constructor() {
    super();
    this.discrepancies = {};
  }

  resetDiscrepancies() {
    this.discrepancies = {};
  }

  findDiscrepancies(
    chargeCodeConfig: ChargeCodeConfig,
    occupancyConfig: OccupancyConfig,
    asOnDate: string,
    data: RRFExtractedData,
  ) {
    this.resetDiscrepancies();
    const occupancyColumn = data.columns.find(
      (column: RRFDataColumn) => column.name === RRUnitInformationField.status.key && !column.discard,
    );

    const marketRentColumn = data.columns.find(
      (column: RRFDataColumn) => column.name === RRUnitInformationField.marketRent.key && !column.discard,
    );

    const leaseExpiryColumn = data.columns.find(
      (column: RRFDataColumn) => column.name === RRLeaseTermsField.endDate.key && !column.discard,
    );

    const unitNoColumn = data.columns.find(
      (column: RRFDataColumn) => column.name === RRUnitInformationField.unit.key && !column.discard,
    );

    const monthlyRentColumns = data.columns.filter((col: RRFDataColumn) =>
      col.type === 'chargeCode' && chargeCodeConfig?.[col.name] === RentRollChargeCode.MonthlyRent.key,
    ).map((col) => col.key);

    data.rows.forEach((row: RRFDataRow, index: number) => {
      const unitNo = row[unitNoColumn?.key] ?? '';
      this.checkLeaseDateDiscrepancies(unitNo, row[leaseExpiryColumn?.key], leaseExpiryColumn, asOnDate, index);
      if (row[occupancyColumn?.key]) {
        const occupancyStatus = row[occupancyColumn.key];
        const monthlyRent = getRowMonthlyRent(row, monthlyRentColumns);

        if (occupancyConfig?.[occupancyStatus as string] === RentRollOccupancyStatus.Occupied.key) {
          const marketRent = row[marketRentColumn?.key] as number;
          this.checkOccupiedUnitsDiscrepancies(
            unitNo, monthlyRent, marketRent, occupancyColumn, marketRentColumn, index);
        }
        if (occupancyConfig?.[occupancyStatus as string] === RentRollOccupancyStatus.Vacant.key) {
          this.checkVacantUnitsDiscrepancies(unitNo, monthlyRent, occupancyColumn, index);
        }
      }
    });
    return this.discrepancies;
  }

  checkOccupiedUnitsDiscrepancies(unitNo, monthlyRent, marketRent, occupancyColumn, marketRentColumn, index) {
    if (monthlyRent === 0) {
      this.discrepancies[unitNo] = this.discrepancies[unitNo] ?? [];
      this.discrepancies[unitNo].push({
        type: 'MonthlyRentZero',
        message: 'This Occupied unit has no Monthly Rent.',
        row: index,
        column: occupancyColumn?.key,
        monthlyRent,
      });
    } else {
      const difference = monthlyRent > marketRent ?
        Math.abs(monthlyRent - marketRent) :
        Math.abs(marketRent - monthlyRent);
      if ((100 * difference) / marketRent > 25) {
        this.discrepancies[unitNo] = this.discrepancies[unitNo] ?? [];
        this.discrepancies[unitNo].push({
          type: 'MonthlyMarketRentRatio',
          message: 'Monthly rent is greater/less than market rent by 25%',
          row: index,
          column: marketRentColumn?.key,
          monthlyRent,
          marketRent,
        });
      }
    }
  }

  checkVacantUnitsDiscrepancies(unitNo, monthlyRent, occupancyColumn, index) {
    if (monthlyRent !== 0) {
      this.discrepancies[unitNo] = this.discrepancies[unitNo] ?? [];
      this.discrepancies[unitNo].push({
        type: 'MonthlyRentNonZero',
        message: 'Monthly rent is non-zero for vacant unit',
        row: index,
        column: occupancyColumn?.key,
        monthlyRent,
      });
    }
  }

  checkLeaseDateDiscrepancies(unitNo, rowLeaseExpiryDate, leaseExpiryColumn, asOnDate, index) {
    const leaseExpiryDate = DateTime.fromISO(rowLeaseExpiryDate as string);
    if (leaseExpiryDate.isValid) {
      const RRAsOnDate = DateTime.fromISO(asOnDate);
      if (leaseExpiryDate.startOf('day') < RRAsOnDate.startOf('day')) {
        this.discrepancies[unitNo] = this.discrepancies[unitNo] ?? [];
        this.discrepancies[unitNo].push({
          type: 'LeaseExpiryBeforeAsOnDate',
          message: 'Lease is expiring before As On Date',
          column: leaseExpiryColumn?.key,
          row: index,
        });
      }
    }
  }
}

export const useRentRollDiscrepanciesService: () =>
  RentRollDiscrepanciesService = () => RentRollDiscrepanciesService.useService();
