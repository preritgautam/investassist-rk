import { BroadcastType } from '../utils/Broadcast';
import LSWrapper from '../utils/LSWrapper';
import { CookieManager, NextCookiesContext } from '../utils/CookieManager';

export type AuthManagerOptions = {
  storageKey: string,
  path: string,
}

export type AuthManagerParams = {
  broadcast: BroadcastType,
  storage: LSWrapper | null,
  cookieManager: CookieManager,
  options?: AuthManagerOptions,
}

export interface UserObject {
  uid: string,
  id: any,
  accountId?: string,
  accountDetails?: object,
}

export type SessionObject<UserType> = {
  user: UserType,
  userData: {},
  session: {},
  token?: string,
  timestamp: number,
}

class AuthManager<UserType extends UserObject = UserObject> {
  private sessionObj: SessionObject<UserType>;
  private readonly storage: LSWrapper;
  private readonly _broadcast: BroadcastType;
  private readonly cookieManager: CookieManager;
  private options: AuthManagerOptions;

  constructor(
    {
      broadcast,
      storage,
      cookieManager,
      options = {
        storageKey: 'USER_SESSION',
        path: '/',
      },
    }: AuthManagerParams,
  ) {
    this.sessionObj = null;
    this.storage = storage;
    this._broadcast = broadcast;
    this.cookieManager = cookieManager;
    this.options = options;
    if (this._broadcast) {
      this._broadcast.onmessage = (({ data: { type, sessionObj } }) => {
        if (type === 'USER_SESSION_STARTED') {
          this.startSession(sessionObj, false);
        } else if (type === 'USER_SESSION_ENDED') {
          this.endSession(false);
        }
      });
    }
    this.syncUser();
  }

  broadcast(event: string, sessionObj: SessionObject<UserType>) {
    if (this._broadcast) {
      this._broadcast.postMessage({ type: event, sessionObj });
    }
  }

  startSession(sessionObj: SessionObject<UserType>, broadcast: boolean = true) {
    this.sessionObj = sessionObj;
    this.cookieManager && this.cookieManager.set(
      this.options.storageKey,
      this.sessionObj,
      { path: this.options.path },
    );

    this.storage && this.storage.set(this.options.storageKey, this.sessionObj);
    broadcast && this.broadcast('USER_SESSION_STARTED', this.sessionObj);
  }

  updateSession(sessionObj: Partial<SessionObject<UserType>>, broadcast: boolean = true) {
    this.sessionObj = { ...this.sessionObj, ...sessionObj };
    this.cookieManager && this.cookieManager.set(
      this.options.storageKey,
      this.sessionObj,
      { path: this.options.path },
    );
    this.storage && this.storage.set(this.options.storageKey, this.sessionObj);
    broadcast && this.broadcast('USER_SESSION_STARTED', this.sessionObj);
  }

  endSession(broadcast: boolean = true) {
    this.sessionObj = null;
    this.cookieManager && this.cookieManager.remove(this.options.storageKey, { path: this.options.path });
    this.storage && this.storage.set(this.options.storageKey, null);
    broadcast && this.broadcast('USER_SESSION_ENDED', null);
  }

  getSessionObj(): SessionObject<UserType> {
    return this.sessionObj || { user: null, userData: null, timestamp: null, session: null };
  }

  startSSRSession(context: NextCookiesContext) {
    if (typeof window === 'undefined') {
      // start SSR session only on server
      const sessionObj = this.cookieManager.get(this.options.storageKey, context);
      if (sessionObj) {
        this.sessionObj = sessionObj;
      } else {
        this.sessionObj = null;
      }
    }
  }

  needResetSession(sessionObj?: SessionObject<UserType>): boolean {
    // There is an account id but not account details
    if (sessionObj.user?.accountId && !sessionObj.user.accountDetails) {
      return true;
    }
    return false;
  }

  syncUser() {
    const sessionObj = this.storage && this.storage.get(this.options.storageKey, null);
    if (sessionObj && this.needResetSession(sessionObj)) {
      this.endSession();
    } else {
      sessionObj && this.startSession(sessionObj, false);
    }
  }
}

export default AuthManager;
