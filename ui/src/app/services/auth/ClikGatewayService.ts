import { Service } from '../../../bootstrap/service/Service';
import {
  getAdminTokenByClikGatewaySSOTokenApi, getClikGatewayAddAccountUrlApi,
  getClikGatewayAdminAuthUrlApi,
  getClikGatewayAuthUrlApi,
  getTokenByClikGatewaySSOTokenApi,
} from '../../api/sso';
import { adminSession, userSession } from '../../../userSession';
import { RoutingService } from '../RoutingService';

export class ClikGatewayService extends Service {
  async getAuthUrl(accountSlug: string, customRedirect?: string) {
    const { data: { authUrl } } = await getClikGatewayAuthUrlApi({ data: { accountSlug, customRedirect } });
    return authUrl;
  }

  async getAdminAuthUrl() {
    const { data: { authUrl } } = await getClikGatewayAdminAuthUrlApi();
    return authUrl;
  }

  async getAddAccountUrl() {
    const { data: { addAccountUrl } } = await getClikGatewayAddAccountUrlApi();
    return addAccountUrl;
  }

  async validateToken(ssoToken: string) {
    try {
      const { data: { data: { user, token, timestamp } } } =
          await getTokenByClikGatewaySSOTokenApi({ data: { ssoToken } });
      userSession.authManager.startSession({ user, token, timestamp, userData: null, session: null });
      return { user };
    } catch (e) {
      if (e?.response?.data?.errCode === 'UserLimitExceeded') {
        const routing: RoutingService = RoutingService.getService();
        const responseData = e?.response?.data;
        const adminName = responseData?.accountAdminName ?? '';
        const adminEmail = responseData?.accountAdminEmail ?? '';
        // eslint-disable-next-line max-len
        alert(`User limit has been exceeded for your account. Please contact account admin [${adminName}] at ${adminEmail} for further information.`);
        await routing.gotoHomePage({});
      } else {
        throw e;
      }
    }
  }

  async validateAdminToken(ssoToken: string) {
    const { data: { data: { user, token, timestamp } } } =
      await getAdminTokenByClikGatewaySSOTokenApi({ data: { ssoToken } });
    adminSession.authManager.startSession({ user, token, timestamp, userData: null, session: null });
    return { user };
  }
}

export const useClikGatewayService: () => ClikGatewayService = () => ClikGatewayService.useService();
