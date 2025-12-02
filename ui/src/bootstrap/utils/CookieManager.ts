import UniversalCookies from 'universal-cookie';
import nextCookies from 'next-cookies';
import { CookieSetOptions } from 'universal-cookie/cjs/types';
import { decodeBase64, encodeBase64 } from './base64';

export type NextCookiesContext = { req?: { headers: { cookie?: string } } };

export class CookieManager {
  private universalCookies: UniversalCookies = new UniversalCookies();

  constructor(private readonly isWeb: boolean) {
  }

  set(key: string, value: any, options: CookieSetOptions = { path: '/' }) {
    if (this.isWeb) {
      const valueJsonStr = JSON.stringify({ value });
      const valueStr = encodeBase64(valueJsonStr);
      this.universalCookies.set(key, valueStr, options);
    } else {
      console.warn('Cookies can only be set on web client');
    }
  }

  get(key: string, context: NextCookiesContext = null): any {
    let valueStr;
    if (this.isWeb) {
      valueStr = this.universalCookies.get(key);
    } else {
      const reqCookies = nextCookies(context);
      valueStr = reqCookies[key];
    }

    try {
      const valueJsonStr = decodeBase64(valueStr);
      return JSON.parse(valueJsonStr).value;
    } catch (e) {
      return undefined;
    }
  }

  remove(key: string, options: CookieSetOptions = { path: '/' }): void {
    if (this.isWeb) {
      this.universalCookies.remove(key, options);
    } else {
      throw new Error('Cookies can only be deleted on web client');
    }
  }
}
