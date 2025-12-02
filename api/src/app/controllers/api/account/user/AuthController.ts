import { controller, get, post, request, response } from '../../../../../framework/plugins/WebPlugin';
import { inject } from '../../../../boot';
import { BaseAuthService } from '../../../../../bootstrap/service/auth/BaseAuthService';
import { SerializerService } from '../../../../../framework/plugins/SerializerPlugin';
import { ISecurityUser } from '../../../../../framework/plugins/SecurityPlugin';
import { Response } from 'express';
import { IUserToken } from '../../../../../bootstrap/models/IUserToken';
import { AccountUserAuthService } from '../../../../service/auth/AccountUserAuthService';
import { ClikGatewayManager } from '../../../../service/manager/ClikGatewayManager';
import { AccountService } from '../../../../service/entity/AccountService';
import { AccountManager } from '../../../../service/manager/AccountManager';
import { IUser } from '../../../../../bootstrap/models/IUser';

@controller({
  route: '/api/account/user/auth',
})
export class AuthController {
  constructor(
    @inject(AccountUserAuthService) private readonly authService: BaseAuthService,
    @inject(SerializerService) private readonly serializer: SerializerService,
    @inject(ClikGatewayManager) private readonly clikGatewayManager: ClikGatewayManager,
    @inject(AccountService) private readonly accountService: AccountService,
    @inject(AccountManager) private readonly accountManager: AccountManager,
  ) {
  }

  @get('/token', { middlewares: ['security.auth.accountUserJwt'] })
  async validateSession(
    @request('user') user: ISecurityUser,
    @response() res: Response,
  ) {
    res.status(200).send({
      data: await this.serializer.serialize({ user }, {
        childOptions: {
          user: { groups: ['withAccountDetails'] },
        },
      }),
    });
  }

  @post('/refresh-token', { middlewares: ['security.auth.accountUserJwt'] })
  async refreshSession(
    @request('user') user: IUser,
    @response() res: Response,
  ) {
    const token = await this.authService.createAuthToken(user, 'accountUserJwt', null);
    res.status(200).send({
      data: await this.serializer.serialize({ user, token: token.token, timestamp: Date.now() }, {
        childOptions: {
          user: { groups: ['withAccountDetails'] },
        },
      }),
    });
  }

  @post('/logout', {
    middlewares: ['security.auth.accountUserJwt'],
  })
  async logout(@request('user') user: ISecurityUser, @response() res: Response) {
    if (user.activeAuthToken) {
      await this.authService.deleteAuthToken(<IUserToken>user.activeAuthToken, null);
    }
    res.send();
  }

  @get('/change-password-url', { middlewares: ['security.auth.accountUserJwt'] })
  async getChangePasswordUrl(
    @request('user') user: ISecurityUser,
    @response() res: Response,
  ) {
    const account = await this.accountService.findById(user?.accountId, null);
    await this.accountManager.ensureCGAccountData(account);
    const changePasswordUrl = this.clikGatewayManager.getChangePasswordUrl(account.slug, user?.cgAccountUser?.email);
    res.send({ changePasswordUrl });
  }
}
