import {
  controller,
  get,
  request,
  response,
} from '../../../../../framework/plugins/WebPlugin';
import { inject } from '../../../../boot';
import { SerializerService } from '../../../../../framework/plugins/SerializerPlugin';
import { AccountManager } from '../../../../service/manager/AccountManager';
import { AccountUserManager } from '../../../../service/manager/AccountUserManager';
import { AccountUser } from '../../../../db/entity/AccountUser';
import { Response } from 'express';
import { AccountService } from '../../../../service/entity/AccountService';
import { Account } from '../../../../db/entity/Account';
import { MailsManager } from '../../../../service/MailsManager';
import { MailService } from '../../../../../framework/plugins/MailerPlugin/service/MailService';
import { AccountTemplateManager } from '../../../../service/manager/AccountTemplateManager';


@controller({
  route: '/api/account/user/accounts',
  middlewares: ['security.auth.accountUserJwt'],
})

export class AccountController {
  constructor(
    @inject(AccountManager) private readonly accountManager: AccountManager,
    @inject(AccountUserManager) private readonly accountUserManager: AccountUserManager,
    @inject(AccountService) private readonly accountService: AccountService,
    @inject(SerializerService) private readonly serializer: SerializerService,
    @inject(MailsManager) private readonly mailsManager: MailsManager,
    @inject(MailService) private readonly mailsService: MailService,
    @inject(AccountTemplateManager) private readonly templateManager: AccountTemplateManager,
  ) {
  }

  @get('/users')
  async getAccountUsers(
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const account = await user.account;
    const accountUsers = await this.accountUserManager.getAccountUsers(account, null);
    res.send({
      accountUsers: await this.serializer.serialize(accountUsers),
    });
  }

  @get('/account')
  async getAccountDetails(
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const account: Account = await user.account;
    res.send(await this.serializer.serialize(
      { account },
    ));
  }

  @get('/account/coa')
  async getAccountCOA(
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const account = await user.account;
    const coa = await this.templateManager.getAccountCOA(account);
    res.send({ coa });
  }

  @get('/account/coa/summary')
  async getAccountCOASummary(
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const account = await user.account;
    const coaSummary = await this.templateManager.getAccountCOASummaryDetails(account);
    res.send({ coaSummary });
  }
}
