import { controller, delete_, params, request, response } from '../../../../../framework/plugins/WebPlugin';
import { isRootUser } from '../../../../middlewares/isRootUser';
import { AccountUser } from '../../../../db/entity/AccountUser';
import { Response } from 'express';
import { inject } from '../../../../boot';
import { SerializerService } from '../../../../../framework/plugins/SerializerPlugin';
import { StripeService } from '../../../../service/stripe/StripeService';
import { AccountUserManager } from '../../../../service/manager/AccountUserManager';

@controller({
  route: '/api/account/root/accounts/users',
  middlewares: ['security.auth.accountUserJwt', isRootUser],
})
export class AccountController {
  constructor(
        @inject(AccountUserManager) private readonly accountUserManager: AccountUserManager,
        @inject(SerializerService) private readonly serializer: SerializerService,
        @inject(StripeService) private readonly stripe: StripeService,
  ) {}

  @delete_('/:userId')
  async deleteAccountUser(
      @params('userId') userId: string,
      @request('user') user: AccountUser,
      @response() res: Response,
  ) {
    const account = await user.account;
    await this.accountUserManager.deleteAccountUser(userId, account, user, null);
    res.send();
  }
}
