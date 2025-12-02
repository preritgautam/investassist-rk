import { DateTime, DateTimeFormatOptions } from 'luxon';
import { LocaleOptions } from 'luxon/src/datetime';

export function camelToSentence(text) {
  const result = text.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export function usDate(d: DateTime, format?: LocaleOptions & DateTimeFormatOptions ) {
  return d.setZone('utc').setLocale('en-US').toLocaleString(format);
}
