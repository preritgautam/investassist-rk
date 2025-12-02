import { UserSession } from './bootstrap/session/UserSession';
import { appConfig } from './config';
import { AccountUser, SuperAdmin } from './types';
import { UnauthorizedApiCallError } from './bootstrap/api/UnauthorizedApiCallError';
import { RoutingService } from './app/services/RoutingService';
import { scramble } from './bootstrap/utils/base64';

const userSession = new UserSession<AccountUser>(
  {
    ...appConfig,
    sessionScope: 'accountUser',
  },
  {
    onApiError: async (e: Error) => {
      if (e instanceof UnauthorizedApiCallError) {
        const routing: RoutingService = RoutingService.getService();
        const currentUrl = window.location.href;
        await routing.gotoUrl(`/?r=${scramble(encodeURIComponent(currentUrl))}`);
        return true;
      }
      return false;
    },
  },
);


const adminSession = new UserSession<SuperAdmin>(
  {
    ...appConfig,
    sessionScope: 'superAdmin',
  },
  {
    onApiError: async (e: Error) => {
      if (e instanceof UnauthorizedApiCallError) {
        const routing: RoutingService = RoutingService.getService();
        const currentUrl = window.location.href;
        await routing.gotoUrl(`/_admin?r=${scramble(encodeURIComponent(currentUrl))}`);
        return true;
      }
      return false;
    },
  },
);


export { userSession, adminSession };
