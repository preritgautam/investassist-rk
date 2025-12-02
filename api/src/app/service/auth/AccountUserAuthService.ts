import { inject, injectable } from '../../boot';
import { BaseAuthService } from '../../../bootstrap/service/auth/BaseAuthService';
import { SecurityService } from '../../../framework/plugins/SecurityPlugin/service/SecurityService';
import { Random } from '../../../framework/plugins/SecurityPlugin/service/Random';
import { EventDispatcher } from '../../../framework/plugins/EventPlugin';
import { PasswordService } from '../../../framework/plugins/SecurityPlugin/service/PasswordService';
import { AccountUserManager } from '../manager/AccountUserManager';
import { AccountUserTokenService } from '../entity/AccountUserTokenService';

@injectable()
export class AccountUserAuthService extends BaseAuthService {
  constructor(
    @inject(AccountUserManager) userService: AccountUserManager,
    @inject(AccountUserTokenService) userTokenService: AccountUserTokenService,
    @inject(SecurityService) securityService: SecurityService,
    @inject(Random) random: Random,
    @inject(EventDispatcher) eventDispatcher: EventDispatcher,
    @inject(PasswordService) passwordService: PasswordService,
  ) {
    super(userService, userTokenService, random, securityService, passwordService, eventDispatcher);
  }
}
