import { DealDocumentStatus, DealDocumentType, DealStatus, NumericValue } from '../../../types';
import { DateTime } from 'luxon';

export function getDealStatusColor(status: DealStatus): string {
  return status === 'New' ? 'warning' :
    status === 'In Progress' ? 'primary' :
      status === 'Completed' ? 'success' : 'gray';
}

export function getDealDocumentStatusColor(status: DealDocumentStatus): string {
  return status === 'New' ? 'warning' :
    status === 'Processing' ? 'warning' :
      status === 'Processed' ? 'primary' :
        status === 'Validated' ? 'success' :
          status === 'Failed' ? 'danger' : 'gray';
}

export function dealDocumentTypeLabel(documentType: DealDocumentType): string {
  if (documentType === 'RRF') return 'Rent Roll';
  if (documentType === 'CF') return 'Cash Flow';
}

const amountFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  currencySign: 'accounting',
});

export function formatAmount(amount: number) {
  return amountFormatter.format(amount);
}

const numberFormatter = new Intl.NumberFormat('en-US');

export function formatNumber(num: number) {
  return numberFormatter.format(num);
}

export function parseNumeric(nValue: NumericValue): number {
  // @ts-ignore
  const value = parseFloat(nValue);
  return isNaN(value) ? 0 : value;
}

export function shortDate(isoString: string) {
  return DateTime.fromISO(isoString).toLocaleString(DateTime.DATE_SHORT);
}

export function todayShortDate() {
  return DateTime.now().toLocaleString(DateTime.DATE_SHORT);
}

export function getMonthYear(date: string) {
  return DateTime.fromISO(date).toFormat('LLL yyyy');
}

export function getMonth(date: string) {
  return DateTime.fromISO(date).toFormat('LLL');
}

export function fileNameWithoutExtension(fileName: string) {
  return fileName.split('.').slice(0, -1).join('.');
}

/**
 * Converts mmddyyyy date to ISO
 * @param {string} dateStr the date string
 * @param {boolean} strict if true, returns '' if date couldn't be parsed. If false tries to replace any missing parts
 * @return {string} the ISO formatted date string or an empty string
 */
export function mmddyyyyToISO(dateStr: string, strict: boolean): string {
  if (!dateStr) {
    return '';
  }
  const parts = dateStr.split('/');

  if (isNaN(parseInt(parts[0]))) {
    parts[0] = '1';
  }

  if (isNaN(parseInt(parts[1]))) {
    parts[1] = '1';
  }

  if (isNaN(parseInt(parts[2]))) {
    parts[2] = '2000';
  }

  if (parts[0].length === 1) {
    parts[0] = `0${parts[0]}`;
  }

  if (parts[1].length === 1) {
    parts[1] = `0${parts[1]}`;
  }

  return `${parts[2]}-${parts[0]}-${parts[1]}`;
}

export function isoToMmddyyyy(dateStr: string) {
  if (!dateStr) {
    return '';
  }
  const parts = dateStr.split('-');
  return `${parts[1]}/${parts[2]}/${parts[0]}`;
}

export function isoMonthToShortDate(iso: string) {
  const [year, month] = iso.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month) - 1]} ${year}`;
}

export function increaseBrightness(hex: string, percent: number) {
  // strip the leading # if it's there
  hex = hex.replace(/^\s*#|\s*$/g, '');

  // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
  if (hex.length == 3) {
    hex = hex.replace(/(.)/g, '$1$1');
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const factor = (100 + percent) / 100;

  const r2 = Math.round(r * factor);
  let r3 = (r2 > 255 ? 255 : r2).toString(16);
  if (r3.length === 1) r3 = '0' + r3;

  const g2 = Math.round(g * factor);
  let g3 = (g2 > 255 ? 255 : g2).toString(16);
  if (g3.length === 1) g3 = '0' + g3;

  const b2 = Math.round(b * factor);
  let b3 = (b2 > 255 ? 255 : b2).toString(16);
  if (b3.length === 1) b3 = '0' + b3;

  return `#` + r3 + g3 + b3;
}


export function toAlphabetColumnName(num) {
  let str = '';
  for (let a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
    str = String.fromCharCode(Number((num % b) / a) + 65) + str;
  }
  return str;
}

export function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), milliseconds);
  });
}

export const isNotNull = (x) => !!x;
