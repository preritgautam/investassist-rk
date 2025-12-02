import { DateTime } from 'luxon';

export function dateFormat(date) {
  return DateTime.fromISO(date).toLocaleString({
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function shortDate(jsDate) {
  return DateTime.fromJSDate(jsDate).toLocaleString(DateTime.DATE_SHORT);
}

export function shortDateIso(dateStr) {
  return DateTime.fromISO(dateStr).toLocaleString(DateTime.DATE_SHORT);
}

export function monthYearDateIso(dateStr) {
  return DateTime.fromISO(dateStr).toFormat('LLL yyyy');
}

export function dayMonthYearDateIso(dateStr) {
  return DateTime.fromISO(dateStr).toFormat('LLL dd, yyyy');
}

