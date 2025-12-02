import { body, controller, patch, post, request, response } from '../../../../../framework/plugins/WebPlugin';
import { inject } from '../../../../boot';
import { AccountUserManager } from '../../../../service/manager/AccountUserManager';
import { AccountUser } from '../../../../db/entity/AccountUser';
import { Response } from 'express';
import { SerializerService } from '../../../../../framework/plugins/SerializerPlugin';
import { UserPreferences } from '../../../../types';

@controller({
  route: '/api/account/user/accountUser',
  middlewares: ['security.auth.accountUserJwt'],
})
export class AccountUserController {
  constructor(
    @inject(AccountUserManager) private readonly manager: AccountUserManager,
    @inject(SerializerService) private readonly serializer: SerializerService,
  ) {}

  @post('/terms')
  async acceptTerms(
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    await this.manager.acceptTerms(user);
    res.status(200).send({
      data: await this.serializer.serialize({ user }, {
        childOptions: {
          user: { groups: ['withAccountDetails'] },
        },
      }),
    });
  }

  @patch('/userPreferences')
  async updateUserPreferences(
      @body('userPreferences') userPreferences: UserPreferences,
      @request('user') user: AccountUser,
      @response() res: Response,
  ) {
    const accountUser = await this.manager.updateUserPreferences(user, userPreferences, null);
    res.send(await this.serializer.serialize({ accountUser }));
  }
}
