import { inject, injectable } from '../../boot';
import { ClikGatewayManager } from '../manager/ClikGatewayManager';
import {
  AbstractAuthStrategyFactory,
} from '../../../framework/plugins/SecurityPlugin/factory/AbstractAuthStrategyFactory';
import { BasicStrategy } from 'passport-http';
import { AccountUserManager } from '../manager/AccountUserManager';


@injectable({
  alias: 'app.security.auth.CGBasicAuthStrategyFactory',
})
export class CGBasicAuthStrategyFactory extends AbstractAuthStrategyFactory {
  constructor(
    @inject(ClikGatewayManager) private readonly cgManager: ClikGatewayManager,
    @inject(AccountUserManager) private readonly auManager: AccountUserManager,
  ) {
    super();
  }

  createStrategy() {
    return new BasicStrategy(async (uid: string, password: string, done) => {
      try {
        const cgUserId = await this.cgManager.authenticateWithCredentials(uid, password);
        const user = await this.auManager.getAccountUserByCGId(cgUserId);
        await this.auManager.ensureAccountUsersCGData([user]);
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (e) {
        return done(e, null);
      }
    });
  }
}
