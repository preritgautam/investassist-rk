import { injectable } from '../boot';
import { config } from '../../framework/plugins/AppConfigPlugin/AppConfigPlugin';

@injectable()
export class UiAppUrlHelper {
  constructor(@config('ui_app.base_url') private readonly appBaseUrl: string) {
  }

  mailsImageBasePath() {
    return `${this.appBaseUrl}/assets/images/mails`;
  }

  resetSuperAdminPasswordUrl(email: string, resetToken: string) {
    const payload = Buffer.from(JSON.stringify({
      email,
      token: resetToken,
    })).toString('base64');

    return `${this.appBaseUrl}/_admin/auth/reset-password?t=${payload}`;
  }

  authClikGatewaySuccessUrl(customRedirect: string = '') {
    return `${this.appBaseUrl}/auth/clik-gateway/success?customRedirect=${customRedirect}`;
  }

  adminAuthClikGatewaySuccessUrl() {
    return `${this.appBaseUrl}/_admin/auth/clik-gateway/success`;
  }

  accountLoginUrl(accountSlug: string) {
    return `${this.appBaseUrl}/${accountSlug}`;
  }

  subscriptionSuccessUrl() {
    return `${this.appBaseUrl}/admin/checkout/success`;
  }

  subscriptionCancelUrl() {
    return `${this.appBaseUrl}/admin/checkout/cancel`;
  }

  manageBillingUrl() {
    return `${this.appBaseUrl}/admin/plan`;
  }

  adminAddAccountSuccessUrl() {
    return `${this.appBaseUrl}/_admin/accounts/add-success`;
  }
}
