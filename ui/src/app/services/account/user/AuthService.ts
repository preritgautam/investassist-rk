import { Service } from '../../../../bootstrap/service/Service';
import {
  logoutAccountUserApi,
  validateAccountUserSessionApi,
  getAccountUserPasswordChangeUrlApi, refreshAccountUserSessionApi, acceptTermsApi,
} from '../../../api/accountUser';
import { userSession } from '../../../../userSession';
import { noopFunc } from '../../../../bootstrap/utils/noop';

export type LoginReturn = {
  user: object,
}

export class AuthService extends Service {
  async validateAccountUserSession(): Promise<LoginReturn> {
    try {
      const { data: { data: { user } } } = await validateAccountUserSessionApi();
      userSession.authManager.updateSession({ user });
      return user;
    } catch (e) {
      throw new Error('Invalid Session');
    }
  };

  async refreshAccountUserSession() {
    try {
      const { data: { data: { user, token, timestamp } } } = await refreshAccountUserSessionApi();
      userSession.authManager.startSession({ user, token, timestamp, userData: null, session: null });
      return user;
    } catch (e) {
      console.error(e);
      throw new Error('Invalid Session');
    }
  }

  async acceptTerms() {
    const { data: { data: { user } } } = await acceptTermsApi();
    userSession.authManager.updateSession({ user });
  }

  async logout(): Promise<any> {
    if (userSession.authManager.getSessionObj().token) {
      await logoutAccountUserApi().catch(noopFunc);
    }
    userSession.authManager.endSession();
  }

  async getChangePasswordUrl() {
    const { data: { changePasswordUrl } } = await getAccountUserPasswordChangeUrlApi();
    return changePasswordUrl;
  }
}

export const useAuthService: () => AuthService = () => AuthService.useService();
