import { injectable } from '../../boot';
import { ExtractDocumentParams } from './MLExtractionService';
import {
  RRAdditionalField,
  RentRollFixedField,
  RRUnitInformationField,
  RRLeaseTermsField,
} from '../../models/enums/RentRollFieldEnum';
import {
  ChargeCodeData,
  MLChargeCode,
  MLChargeCodeColumn,
  RRFColumn,
  RRFDataColumn,
  RRFDataFieldType,
  RRFDataRow, RRFMLColumn,
  RRFMLPageResult,
  RRFMLResponse, RRFMLRow,
} from '../../types';
import { RentRollOccupancyStatus } from '../../models/enums/RentRollOccupancyStatus';
import { DateTime } from 'luxon';
import { OtherChargeCodes } from '../../constant/ChargeCodeList';

@injectable()
export class MFRRFResponseParser {
  private static prepareChargeCodeColumns(chargeCodes: MLChargeCodeColumn[], columnCount: number): RRFDataColumn[] {
    return chargeCodes.map((cc, i) => {
      return {
        type: 'chargeCode',
        key: `col${i + columnCount}`,
        sourceColumnIndex: null,
        header: cc.code,
        name: cc.code,
      };
    });
  }

  public parseResponse(extractionRequest: ExtractDocumentParams, mlResponse: RRFMLResponse) {
    let columns: RRFColumn[] = [];
    const rows: RRFDataRow[] = [];
    for (const pageResult of mlResponse.result) {
      this.addPageResult(pageResult, columns, rows);
    }

    MFRRFResponseParser.transformColumns(columns);
    MFRRFResponseParser.transformToChargeCodeColumns(columns);


    this.normalizeDateColumns(columns, rows);
    this.ensureStatusColumn(columns, rows);

    this.ensureSqFtColumn(columns, rows);


    const chargeCodeColumns =
      MFRRFResponseParser.prepareChargeCodeColumns(mlResponse.charge_codes ?? [], columns.length);
    if (chargeCodeColumns.length > 0) {
      columns = [...columns, ...chargeCodeColumns];
      let dataRowIndex = 0;
      for (const pageResult of mlResponse.result) {
        const chargeCodeColumnIndex = pageResult.columns.findIndex((c) => c.name === 'charge_code_list');
        if (chargeCodeColumnIndex > -1) {
          pageResult.rentroll.forEach((row) => {
            this.addRowChargeCodes(row, chargeCodeColumnIndex, rows[dataRowIndex], columns);
            dataRowIndex++;
          });
        } else {
          dataRowIndex += pageResult.rentroll.length;
        }
      }
    }
    MFRRFResponseParser.disableTotalChargeCode(columns);
    this.addRenovatedColumn(columns, rows);
    this.addAffordableColumn(columns, rows);
    this.addMTMColumn(columns, rows);

    // sort columns to have additional details at end
    columns.sort((col1, col2) => {
      if (col2.isStatic === undefined) {
        if ((col2 as RRFDataColumn).type === 'additionalDetails') {
          return -1;
        }
      }
      return 0;
    });

    return {
      extracted: {
        rows, columns,
      },
    };
  }

  private addMTMColumn(columns: RRFColumn[], rows: RRFDataRow[]) {
    const mtmKey = `col${columns.length}`;
    columns.push({
      key: mtmKey,
      type: 'fixed',
      name: RentRollFixedField.MTM.key,
      label: RentRollFixedField.MTM.label,
      header: null,
      discard: false,
      sourceColumnIndex: null,
    });
    // Todo: may add a logic to set default MTM values
    rows.forEach((row: RRFDataRow) => row[mtmKey] = 'No');
  }

  private addRenovatedColumn(columns: RRFColumn[], rows: RRFDataRow[]) {
    const renovatedKey = `col${columns.length}`;
    columns.push({
      key: renovatedKey,
      type: 'fixed',
      name: RentRollFixedField.Renovated.key,
      label: RentRollFixedField.Renovated.label,
      header: null,
      discard: false,
      sourceColumnIndex: null,
    });
    rows.forEach((row: RRFDataRow) => row[renovatedKey] = 'No');
  }


  private addAffordableColumn(columns: RRFColumn[], rows: RRFDataRow[]) {
    const affordableKey = `col${columns.length}`;
    columns.push({
      key: affordableKey,
      type: 'fixed',
      name: RentRollFixedField.Affordable.key,
      label: RentRollFixedField.Affordable.label,
      header: null,
      discard: false,
      sourceColumnIndex: null,
    });
    rows.forEach((row: RRFDataRow) => row[affordableKey] = 'Market');
  }

  // adds column data except charge code data
  private addPageResult(
    pageResult: RRFMLPageResult, existingColumns: RRFColumn[], rows: RRFDataRow[],
  ) {
    const columnMapping = this.mapPageColumnsWithExistingColumns(existingColumns, pageResult.columns);
    const idColumnIndex = pageResult.columns.findIndex((col) => col.name === 'id');
    pageResult.rentroll.forEach((row) => {
      const dataRow: RRFDataRow = { id: row[idColumnIndex] as number };
      for (const mlColumnIndex of Reflect.ownKeys(columnMapping)) {
        const columnIndex = columnMapping[mlColumnIndex as string];
        const columnKey = existingColumns[columnIndex].key;
        dataRow[columnKey] = row[mlColumnIndex as string] as string | number;
      }
      rows.push(dataRow);
    });
  }

  // maps columns except charge code columns
  private mapPageColumnsWithExistingColumns(
    existingColumns: RRFColumn[], pageColumns: RRFMLColumn[],
  ): Record<string, number> {
    const columnUsed = existingColumns.map(() => false);
    const mapping = {};
    pageColumns.forEach((pageColumn, newColumnIndex) => {
      for (let existingColumnIndex = 0; existingColumnIndex < existingColumns.length; existingColumnIndex++) {
        if (
          existingColumns[existingColumnIndex].name === pageColumn.name &&
          columnUsed[existingColumnIndex] === false
        ) {
          columnUsed[existingColumnIndex] = true;
          mapping[newColumnIndex] = existingColumnIndex;
        }
      }
      if (mapping[newColumnIndex] === undefined) {
        // Ignore charge code column mapping. It's already done earlier
        if (pageColumn.name !== 'charge_code_list' && pageColumn.name !== 'id') {
          const type: RRFDataFieldType = RRUnitInformationField.get(pageColumn.name) ? 'unitInformation' :
            RRAdditionalField.get(pageColumn.name) ? 'additionalDetails' :
              RRLeaseTermsField.get(pageColumn.name) ? 'leaseTerms' : 'additionalDetails';
          existingColumns.push({
            key: `col${existingColumns.length}`,
            name: pageColumn.name,
            header: pageColumn.header,
            sourceColumnIndex: pageColumn.source_col_index,
            type,
          });
          columnUsed.push(true);
          mapping[newColumnIndex] = existingColumns.length - 1;
        }
      }
    });
    return mapping;
  }

  private addRowChargeCodes(
    row: RRFMLRow, chargeCodeColumnIndex: number, rrfDataRow: RRFDataRow, columns: RRFColumn[],
  ) {
    const chargeCodeList: MLChargeCode[] = row[chargeCodeColumnIndex] as MLChargeCode[];
    for (const charge of chargeCodeList) {
      const column = columns.find((c: RRFDataColumn) => {
        return c.type === 'chargeCode' && c.header === charge.code;
      });

      if (rrfDataRow[column.key]) {
        (rrfDataRow[column.key] as ChargeCodeData).sum += charge.CC_charges_sum;
      } else {
        rrfDataRow[column.key] = {
          code: charge.code,
          charges: charge.CC_charges,
          otherCharges: charge.CC_other_charges,
          sum: charge.CC_charges_sum,
        };
      }
    }
  }

  private ensureStatusColumn(columns: RRFColumn[], rows: RRFDataRow[]) {
    const statusColumn = columns.find((col: RRFColumn) => col.name === RRUnitInformationField.status.key);
    if (!statusColumn) {
      const statusKey = `col${columns.length}`;
      columns.push({
        key: statusKey,
        type: 'unitInformation',
        name: RRUnitInformationField.status.key,
        label: RRUnitInformationField.status.label,
        header: null,
        discard: false,
        sourceColumnIndex: null,
      });

      const tenantNameKey = columns.find((col: RRFColumn) => col.name === RRUnitInformationField.tenantName.key)?.key;
      const tenantCodeKey = columns.find((col: RRFColumn) => col.name === RRUnitInformationField.tenantCode.key)?.key;
      rows.forEach((row: RRFDataRow) => {
        let status = RentRollOccupancyStatus.Occupied.key;
        const name = (row[tenantNameKey] as string)?.toLowerCase() ?? '';
        const code = (row[tenantCodeKey] as string)?.toLowerCase() ?? '';
        if (name.includes('vacant') || code.includes('vacant')) {
          status = RentRollOccupancyStatus.Vacant.key;
        } else if (!name.trim().length && !code.trim().length) {
          status = RentRollOccupancyStatus.Vacant.key;
        } else if (name.includes('admin') || code.includes('admin')) {
          status = RentRollOccupancyStatus.Admin.key;
        } else if (name.includes('down') || code.includes('down')) {
          status = RentRollOccupancyStatus.Down.key;
        } else if (name.includes('model') || code.includes('model')) {
          status = RentRollOccupancyStatus.Model.key;
        }
        row[statusKey] = status;
      });
    }
  }


  private ensureSqFtColumn(columns: RRFColumn[], rows: RRFDataRow[]) {
    const sqFtColumn = columns.find((col: RRFColumn) => col.name === RRUnitInformationField.sqFt.key);
    if (!sqFtColumn) {
      const sqFtKey = `col${columns.length}`;
      columns.push({
        key: sqFtKey,
        type: 'unitInformation',
        name: RRUnitInformationField.sqFt.key,
        label: RRUnitInformationField.sqFt.label,
        header: null,
        discard: false,
        sourceColumnIndex: null,
      });

      rows.forEach((row: RRFDataRow) => {
        row[sqFtKey] = 0;
      });
    }
  }

  private static transformColumns(columns: RRFColumn[]) {
    columns.forEach((col: RRFDataColumn) => {
      if (col.name === 'monthly_rent') {
        col.type = 'chargeCode';
        col.name = col.header;
      } else if (col.name === 'subsidy') {
        col.type = 'chargeCode';
        col.name = col.header;
      } else if (col.name === 'concession') {
        col.type = 'chargeCode';
        col.name = col.header;
      } else if (col.name === 'other_charge_code') {
        col.type = 'chargeCode';
        col.name = col.header;
      } else if (col.name === 'potential_rent') {
        col.name = 'market_rent';
        col.type = 'unitInformation';
      }
    });
  }

  private static disableTotalChargeCode(columns: RRFColumn[]) {
    columns.forEach((col: RRFDataColumn) => {
      if (col.type === 'chargeCode') {
        const lowerName = col.name.toLowerCase();
        if (['total', 'total:'].includes(lowerName)) {
          col.discard = true;
        }
      }
    });
  }

  private normalizeDateColumns(columns: RRFColumn[], rows: RRFDataRow[]) {
    const dateColumns = [
      RRLeaseTermsField.startDate.key,
      RRLeaseTermsField.endDate.key,
      RRLeaseTermsField.moveInDate.key,
      RRLeaseTermsField.moveOutDate.key,
    ];

    const dateColKeys = columns
      .filter((c: RRFDataColumn) => dateColumns.includes(c.name))
      .map((c: RRFDataColumn) => c.key);

    rows.forEach((row: RRFDataRow) => {
      dateColKeys.forEach((dateKey: string) => {
        const dateOriginal = row[dateKey] as string ?? '';

        let date: DateTime;
        if (dateOriginal.length > 9) {
          date = DateTime.fromFormat(dateOriginal, 'LL/dd/yyyy');
          if (!date.isValid) {
            date = DateTime.fromFormat(dateOriginal, 'dd/LL/yyyy');
          }
        } else {
          date = DateTime.fromFormat(dateOriginal, 'LL/dd/yy');
          if (!date.isValid) {
            date = DateTime.fromFormat(dateOriginal, 'L/d/yy');
          }
          if (!date.isValid) {
            date = DateTime.fromFormat(dateOriginal, 'd/L/yy');
          }
        }

        if (date && date.isValid) {
          row[dateKey] = date.toFormat('LL/dd/yyyy');
        }
      });
    });
  }

  private static transformToChargeCodeColumns(columns: RRFColumn[]) {
    columns.forEach((col: RRFDataColumn) => {
      if (
        col.type === 'additionalDetails' &&
        col.name.startsWith('other_header') &&
        OtherChargeCodes[col.header.toLowerCase()]
      ) {
        col.type = 'chargeCode';
        col.name = col.header;
      }
    });
  }
}
