import { inject, injectable } from '../../boot';
import { UiAppUrlHelper } from '../UiAppUrlHelper';
import { config } from '../../../framework/plugins/AppConfigPlugin/AppConfigPlugin';
import { AppConfigType } from '../../config';
import axios from 'axios';
import { encodeBase64, scramble } from '../../../bootstrap/utils/base64';
import { cacheable } from '../../../framework/plugins/CachePlugin';
import { CGAccount, CGAccountUser, CGSuperAdmin } from '../../types';

@injectable()
export class ClikGatewayManager {
  constructor(
    @inject(UiAppUrlHelper) private readonly uiAppUrlHelper: UiAppUrlHelper,
    @config('clikGateway') private readonly clikGatewayConfig: AppConfigType['clikGateway'],
  ) {
  }

  private getAuthHeaders() {
    return {
      Authorization: `Basic ${encodeBase64(`${this.clikGatewayConfig.key}:${this.clikGatewayConfig.secret}`)}`,
    };
  }

  async getAuthUrl(accountSlug?: string, customRedirect?: string): Promise<string> {
    const redirectUrl = this.uiAppUrlHelper.authClikGatewaySuccessUrl(customRedirect);
    const url = `${this.clikGatewayConfig.apiBaseUrl}/${this.clikGatewayConfig.getAuthUrlApi}`;
    const { data: { authUrl } } = await axios.post(url, { redirectUrl, accountSlug }, {
      headers: this.getAuthHeaders(),
    });
    return authUrl;
  }

  async getAdminAuthUrl() {
    const redirectUrl = this.uiAppUrlHelper.adminAuthClikGatewaySuccessUrl();
    const url = `${this.clikGatewayConfig.apiBaseUrl}/${this.clikGatewayConfig.getAdminAuthUrlApi}`;
    const { data: { authUrl } } = await axios.post(url, { redirectUrl }, {
      headers: this.getAuthHeaders(),
    });
    return authUrl;
  }

  async getAddAccountUrl() {
    const redirectUrl = this.uiAppUrlHelper.adminAddAccountSuccessUrl();
    const url = `${this.clikGatewayConfig.apiBaseUrl}/${this.clikGatewayConfig.getAddAccountUrlApi}`;
    const { data: { addAccountUrl } } = await axios.post(url, { redirectUrl }, {
      headers: this.getAuthHeaders(),
    });
    return addAccountUrl;
  }

  getChangePasswordUrl(accountSlug: string, userEmail: string) {
    const slug = scramble(accountSlug);
    const email = scramble(userEmail);
    return `${this.clikGatewayConfig.appBaseUrl}/user/settings/change-password?slug=${slug}&email=${email}`;
  }

  async getUserBySSOToken(ssoToken: string): Promise<CGAccountUser> {
    const url = `${this.clikGatewayConfig.apiBaseUrl}/${this.clikGatewayConfig.validateTokenApi}`;
    const { data: { user: userProfile } } = await axios.post(url, { token: ssoToken }, {
      headers: this.getAuthHeaders(),
    });
    return userProfile;
  }

  async getAdminBySSOToken(ssoToken: string): Promise<CGSuperAdmin> {
    const url = `${this.clikGatewayConfig.apiBaseUrl}/${this.clikGatewayConfig.validateAdminTokenApi}`;
    const { data: { user: userProfile } } = await axios.post(url, { token: ssoToken }, {
      headers: this.getAuthHeaders(),
    });
    return userProfile;
  }

  @cacheable({ ttl: 3600 })
  async getCGAccountDetails(cgAccountId: string): Promise<CGAccount> {
    const url = `${this.clikGatewayConfig.apiBaseUrl}/${this.clikGatewayConfig.getAccountApi}/${cgAccountId}`;
    const { data: { account } } = await axios.get(url, { headers: this.getAuthHeaders() });
    return account as CGAccount;
  }

  async getCGAccountUsersList(cgAccountId: string): Promise<CGAccount[]> {
    const url = `${this.clikGatewayConfig.apiBaseUrl}/${this.clikGatewayConfig.getAccountUsersApi}/${cgAccountId}`;
    return await axios.get(url, { headers: this.getAuthHeaders() });
  }

  @cacheable({ ttl: 3600 })
  async getCGAccountUserDetails(cgAccountUserId: string): Promise<CGAccountUser> {
    const url = `${this.clikGatewayConfig.apiBaseUrl}/${this.clikGatewayConfig.getAccountUserApi}/${cgAccountUserId}`;
    const { data: { user } } = await axios.get(url, { headers: this.getAuthHeaders() });
    return user as CGAccountUser;
  }

  async authenticateWithCredentials(username: string, password: string): Promise<string> {
    const { data: { data: { user } } } = await axios.post(
      `${this.clikGatewayConfig.apiBaseUrl}/api/account/user/auth/token`,
      {
        username, password,
      },
    );

    return user.id;
  }
}
