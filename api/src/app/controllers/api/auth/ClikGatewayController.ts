import { body, controller, post, response } from '../../../../framework/plugins/WebPlugin';
import { inject } from '../../../boot';
import { ClikGatewayManager } from '../../../service/manager/ClikGatewayManager';
import { Response } from 'express';
import { AccountManager } from '../../../service/manager/AccountManager';
import { AccountUserManager } from '../../../service/manager/AccountUserManager';
import { CGAccountUser } from '../../../types';
import { Account } from '../../../db/entity/Account';
import { AccountUserAuthService } from '../../../service/auth/AccountUserAuthService';
import { BaseAuthService } from '../../../../bootstrap/service/auth/BaseAuthService';
import { SerializerService } from '../../../../framework/plugins/SerializerPlugin';
import { AccountDisabledError } from '../../../errors/AccountDisabledError';

@controller({
  route: '/api/auth/clik-gateway',
})
export class ClikGatewayController {
  constructor(
    @inject(ClikGatewayManager) private readonly clikGatewayManager: ClikGatewayManager,
    @inject(AccountManager) private readonly accountManager: AccountManager,
    @inject(AccountUserManager) private readonly accountUserManager: AccountUserManager,
    @inject(AccountUserAuthService) private readonly authService: BaseAuthService,
    @inject(SerializerService) private readonly serializer: SerializerService,
  ) {
  }

  @post('/auth-url')
  async getAuthUrl(
    @body('accountSlug') accountSlug: string,
    @body('customRedirect') customRedirect: string,
    @response() res: Response,
  ) {
    const authUrl = await this.clikGatewayManager.getAuthUrl(accountSlug, customRedirect);
    res.send({ authUrl });
  }

  @post('/token')
  async getToken(
    @body('ssoToken') ssoToken: string,
    @response() res: Response,
  ) {
    const cgUAccountUser: CGAccountUser = await this.clikGatewayManager.getUserBySSOToken(ssoToken);
    const cgAccount = cgUAccountUser.account;

    const account: Account = await this.accountManager.getOrAddAccount(cgAccount, null);

    if (!account.enabled) {
      throw new AccountDisabledError();
    }


    let accountUser;
    try {
      accountUser = await this.accountUserManager.getOrAddAccountUser(account, cgUAccountUser, null);
    } catch (e) {
      const accountAdmin = await this.accountUserManager.getAccountRootUser(account);
      res.status(400).send({
        errCode: 'UserLimitExceeded',
        accountAdminName: accountAdmin?.cgAccountUser?.name,
        accountAdminEmail: accountAdmin?.cgAccountUser?.email,
      });
    }

    await this.authService.deleteExistingTokens(accountUser);
    const token = await this.authService.createAuthToken(accountUser, 'accountUserJwt', null);

    res.status(200).send({
      data: await this.serializer.serialize({
        timestamp: Date.now(),
        user: accountUser,
        token: token.token,
      }, {
        childOptions: {
          user: { groups: ['id', 'withAccountDetails'] },
        },
      }),
    });
  }
}
