import {
  controller,
  delete_,
  get,
  params,
  response,
} from '../../../../framework/plugins/WebPlugin';
import { inject } from '../../../boot';
import { SerializerService } from '../../../../framework/plugins/SerializerPlugin';
import { Response } from 'express';
import { AccountsController } from './AccountsController';
import { AccountUserManager } from '../../../service/manager/AccountUserManager';
import { AccountService } from '../../../service/entity/AccountService';

@controller({
  route: '/:accountId/users',
  middlewares: ['security.auth.superAdminJwt'],
  parent: AccountsController,
})
export class AccountUsersController {
  constructor(
        @inject(SerializerService) private readonly serializer: SerializerService,
        @inject(AccountUserManager) private readonly accountUserManager: AccountUserManager,
        @inject(AccountService) private readonly accountService: AccountService,
  ) {
  }

    @get('/')
  async getAllAccountUsers(
        @params('accountId') accountId: string,
        @response() res: Response,
  ) {
    const account = await this.accountService.findById(accountId, null);
    const accountUsers = await this.accountUserManager.getAccountUsers(account, null);
    res.send({
      accountUsers: await this.serializer.serialize(accountUsers),
    });
  }

    @delete_('/:userId')
    async deleteAccountUser(
        @params('accountId') accountId: string,
        @params('userId') userId: string,
        @response() res: Response,
    ) {
      const account = await this.accountService.findById(accountId, null);
      const accountAdmin = await this.accountUserManager.getAccountRootUser(account);
      await this.accountUserManager.deleteAccountUser(userId, account, accountAdmin, null);
      res.send();
    }
}
