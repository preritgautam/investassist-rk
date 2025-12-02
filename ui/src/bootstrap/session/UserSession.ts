import React from 'react';
import { Broadcast, BroadcastType } from '../utils/Broadcast';
import LSWrapper from '../utils/LSWrapper';
import { CookieManager } from '../utils/CookieManager';
import AuthManager, { UserObject } from './AuthManager';
import ApiClient from '../api/ApiClient';
import ApiFactory from '../api/ApiFactory';

interface AuthManagerWrapperParams {
  appName: string,
  appUniqueSlug: string,
  sessionScope: string,
}

export interface UseAuthManagerReturn<UserType extends UserObject> {
  user: UserType,
  userData: object,
  token: string,
  timestamp: number,
}

class AuthManagerWrapper<UserType extends UserObject> {
  private readonly broadcast: BroadcastType = null;
  private readonly storage: LSWrapper = null;
  private readonly isWeb: boolean = false;
  private readonly appName: string;
  private readonly appUniqueSlug: string;
  private readonly sessionScope: string;
  private readonly cookieManager: CookieManager;
  readonly authManager: AuthManager<UserType>;

  constructor({ appName, appUniqueSlug, sessionScope }: AuthManagerWrapperParams) {
    this.isWeb = typeof window !== 'undefined';
    this.appName = appName;
    this.appUniqueSlug = appUniqueSlug;
    this.sessionScope = sessionScope;
    this.broadcast = new Broadcast(`${this.appName}_AUTH_CHANNEL_${appUniqueSlug}_${sessionScope}`);
    this.storage = this.isWeb ? new LSWrapper(`${this.appName}_${appUniqueSlug}_${sessionScope}`) : null;
    this.cookieManager = new CookieManager(this.isWeb);
    this.authManager = new AuthManager<UserType>({
      broadcast: this.broadcast,
      storage: this.storage,
      cookieManager: this.cookieManager,
      options: {
        storageKey: `USER_SESSION_${sessionScope}`,
        path: '/',
      },
    });
  }

  useAuthManager(): UseAuthManagerReturn<UserType> {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const sessionObj = React.useMemo(() => this.authManager.getSessionObj(), []);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [userSession, setUserSession] = React.useState<UseAuthManagerReturn<UserType>>({
      user: sessionObj.user,
      userData: sessionObj.userData,
      token: sessionObj.token,
      timestamp: sessionObj.timestamp,
    });

    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      const channel = new Broadcast(`${this.appName}_AUTH_CHANNEL_${this.appUniqueSlug}_${this.sessionScope}`);

      channel.onmessage = function({ data: { type, sessionObj } }) {
        if (type === 'USER_SESSION_STARTED') {
          setUserSession({
            user: sessionObj.user,
            userData: sessionObj.userData,
            token: sessionObj.token,
            timestamp: sessionObj.timestamp,
          });
        } else if (type === 'USER_SESSION_ENDED') {
          setUserSession({ user: null, userData: null, token: null, timestamp: null });
        }
      };

      return () => channel.close();
    }, []);

    return userSession;
  }
}


interface UserSessionOptions {
  onApiError?: (e: Error) => Promise<boolean> | boolean;
}

class UserSession<UserType extends UserObject> {
  readonly apiFactory: ApiFactory;
  readonly authManager: AuthManager<UserType>;
  readonly useAuthManager: () => UseAuthManagerReturn<UserType>;

  constructor(appConfig, options: UserSessionOptions) {
    const authWrapper = new AuthManagerWrapper<UserType>(appConfig);
    const apiClient = new ApiClient({
      apiBaseUrl: appConfig.apiBaseUrl,
      authManager: authWrapper.authManager,
      debug: false,
    });

    this.apiFactory = new ApiFactory({ apiClient: apiClient, onError: options.onApiError });
    this.authManager = authWrapper.authManager;
    this.useAuthManager = authWrapper.useAuthManager.bind(authWrapper);
  }
}

export { UserSession };
