import { ChargeCodeData, RRFDataColumn, RRFDataRow } from '../../../../../../../types';
import { RentRollDataService } from '../../../../../../services/document/RentRollDataService';
import { formatAmount, formatNumber } from '../../../../../../services/utils/utils';

export function copyData<T extends object>(data: T[]): T[] {
  return data.map((r) => ({ ...r }));
}


export function getRowId(params) {
  return params.data.id;
}

export function formatValue(params: { data: any, value: any }, dColumn: RRFDataColumn) {
  const rentRollDataService: RentRollDataService = RentRollDataService.getService();
  const field = rentRollDataService.getRRColumnField(dColumn);
  if (params.data.__isSummary) {
    if (typeof params.value === 'object' && params.value.hasOwnProperty('total')) {
      if (field) {
        if (['amount', 'amount_psf'].includes(field.options.type)) {
          return `Σ: ${formatAmount(params.value.total)}`;
        }
      }
      return `Σ: ${params.value.total}`;
    }
    if (typeof params.value === 'object' && params.value.hasOwnProperty('count')) {
      return `#: ${params.value.count}`;
    }
    if (dColumn.type === 'chargeCode') {
      return `Σ: ${formatAmount(params.value)}`;
    }
  } else {
    if (dColumn.type === 'chargeCode') {
      return formatAmount(params.value);
    }
    if (field) {
      if (['amount', 'amount_psf'].includes(field.options.type)) {
        return formatAmount(params.value ?? 0); // added a check for newly inserted row
      } else if (field.options.type === 'number') {
        return formatNumber(params.value ?? 0);
      }
    }
  }
  return params.value;
}

export function getValue(params: { data: any }, dColumn: RRFDataColumn) {
  const rentRollDataService: RentRollDataService = RentRollDataService.getService();

  if (params.data.__isSummary) {
    return params.data[dColumn.key];
  } else {
    if (dColumn.type === 'chargeCode') {
      return rentRollDataService.getChargeCodeValue(params.data[dColumn.key]);
    }
  }

  return params.data[dColumn.key];
}

export function getRowMonthlyRent(row: RRFDataRow, monthlyRentColumns: string[]) {
  const rentRollDataService: RentRollDataService = RentRollDataService.getService();
  return Reflect.ownKeys(row).reduce((rent: number, rowKey: string) => {
    if (monthlyRentColumns.includes(rowKey)) {
      rent = rent + rentRollDataService.getChargeCodeValue(row[rowKey] as ChargeCodeData);
    }
    return rent;
  }, 0);
}

export const TextFilterParams = {
  suppressMenu: false,
  filter: 'agTextColumnFilter',
  filterParams: {
    buttons: ['apply', 'reset', 'cancel'],
    closeOnApply: true,
  },
};
export const NumberFilterParams = {
  suppressMenu: false,
  filter: 'agNumberColumnFilter',
  filterParams: {
    buttons: ['apply', 'reset', 'cancel'],
    closeOnApply: true,
  },
};
export const DateFilterParams = {
  suppressMenu: false,
  filter: 'agDateColumnFilter',
  filterParams: {
    buttons: ['apply', 'reset', 'cancel'],
    closeOnApply: true,
    comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
      const dateAsString = cellValue;

      if (dateAsString == null) {
        return 0;
      }

      const dateParts = dateAsString.split('/');
      const month = Number(dateParts[0]) - 1;
      const day = Number(dateParts[1]);
      const year = Number(dateParts[2]);
      const cellDate = new Date(year, month, day);

      if (cellDate < filterLocalDateAtMidnight) {
        return -1;
      } else if (cellDate > filterLocalDateAtMidnight) {
        return 1;
      }
      return 0;
    },
  },
};
