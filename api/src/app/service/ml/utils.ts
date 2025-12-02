import * as lodash from 'lodash';
import { DateTime } from 'luxon';

export function isANumber(str) {
  return !/\D/.test(str);
}

export function removeSpecialChar(txt) {
  if (txt !== undefined) {
    return txt.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, function(l) {
      return l.toUpperCase();
    });
  }
}

export function getCleanRows(rows, columns) {
  const columnNames = columns.map((c) => c.name);
  return rows.map((row) => ({
    options: row.options || {},
    ...lodash.pick(row, columnNames),
  }));
}

export function parseDate(text: string, formats: string[] = ['MM/dd/yyyy', 'M/d/yyyy', 'MM/dd/yy', 'M/d/yy']) {
  for (const format of formats) {
    const date = DateTime.fromFormat(text, format);
    if (date.isValid) {
      return date;
    }
  }
  return null;
}
