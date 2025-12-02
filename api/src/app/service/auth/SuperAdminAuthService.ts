import { inject, injectable } from '../../boot';
import { SuperAdminService } from '../entity/SuperAdminService';
import { SuperAdminTokenService } from '../entity/SuperAdminTokenService';
import { BaseAuthService } from '../../../bootstrap/service/auth/BaseAuthService';
import { SecurityService } from '../../../framework/plugins/SecurityPlugin/service/SecurityService';
import { Random } from '../../../framework/plugins/SecurityPlugin/service/Random';
import { EventDispatcher } from '../../../framework/plugins/EventPlugin';
import { PasswordService } from '../../../framework/plugins/SecurityPlugin/service/PasswordService';

@injectable()
export class SuperAdminAuthService extends BaseAuthService {
  constructor(
    @inject(SuperAdminService) userService: SuperAdminService,
    @inject(SuperAdminTokenService) userTokenService: SuperAdminTokenService,
    @inject(SecurityService) securityService: SecurityService,
    @inject(Random) random: Random,
    @inject(EventDispatcher) eventDispatcher: EventDispatcher,
    @inject(PasswordService) passwordService: PasswordService,
  ) {
    super(userService, userTokenService, random, securityService, passwordService, eventDispatcher);
  }
}
