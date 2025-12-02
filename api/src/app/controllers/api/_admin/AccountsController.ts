import {
  body,
  controller,
  delete_,
  get,
  params,
  patch,
  post,
  request,
  response,
} from '../../../../framework/plugins/WebPlugin';
import { inject } from '../../../boot';
import { AccountManager, UpdateAccountParams } from '../../../service/manager/AccountManager';
import { Account } from '../../../db/entity/Account';
import { SerializerService } from '../../../../framework/plugins/SerializerPlugin';
import { Request, Response } from 'express';
import { UploadModelFileMiddleware } from '../../../middlewares/UploadModelFileMiddleware';
import { AccountTemplateService } from '../../../service/entity/AccountTemplateService';
import { AccountService } from '../../../service/entity/AccountService';
import { storage } from '../../../../framework/plugins/FileStoragePlugin/decorator/storage';
import { AbstractStorage } from '../../../../framework/plugins/FileStoragePlugin/storage/AbstractStorage';
import { map } from 'radash';
import { Deal } from '../../../db/entity/Deal';
import { DealManager } from '../../../service/manager/DealManager';

@controller({
  route: '/api/_admin/accounts',
  middlewares: ['security.auth.superAdminJwt'],
})
export class AccountsController {
  constructor(
    @inject(SerializerService) private readonly serializer: SerializerService,
    @inject(AccountManager) private readonly accountManager: AccountManager,
    @inject(AccountTemplateService) private readonly accountTemplateService: AccountTemplateService,
    @inject(AccountService) private readonly accountService: AccountService,
    @storage('dealDocuments') private readonly documentsStore: AbstractStorage,
    @inject(DealManager) private readonly dealManager: DealManager,
  ) {
  }

  @get('/')
  async getAllAccounts(@response() res: Response) {
    const accounts: Account[] = await this.accountManager.getAllAccounts();
    res.send({
      accounts: await this.serializer.serialize(accounts),
    });
  }

  @post('/')
  async createAccount(
    @request() req: Request,
    @body('cgAccountId') cgAccountId: string,
    @body('cgUserId') cgUserId: string,
    @response() res: Response,
  ) {
    const { account, admin } = await this.accountManager.createAccountFromCGAccount(cgAccountId, cgUserId);
    res.send(await this.serializer.serialize({
      account, admin,
    }));
  }

  @patch('/:accountId')
  async updateAccount(
    @params('accountId') accountId: string,
    @body('account') updateParams: UpdateAccountParams,
    @response() res: Response,
  ) {
    const account = await this.accountManager.updateAccount(accountId, updateParams, null);
    try {
      await this.accountManager.ensureCGAccountData(account);
    } catch (e) {
      // This may or may not work depending on which CG we are pointing to. Shouldn't be a problem in actual
      // environments only on developer machines.
    }
    res.send({
      account: await this.serializer.serialize({ account }),
    });
  }

  @post('/:accountId/templates', {
    middlewares: [UploadModelFileMiddleware],
  })
  async addTemplate(
    @request('file') modelFile: Express.Multer.File,
    @params('accountId') accountId: string,
    @body('name') name: string,
    @body('chartOfAccount') chartOfAccount: string,
    @response() res: Response,
  ) {
    const account = await this.accountService.findById(accountId, null);
    const template = await this.accountTemplateService.addAccountTemplate(account, {
      name: name,
      chartOfAccount: chartOfAccount,
      modelFile: modelFile,
    });
    res.status(201).send({
      template: await this.serializer.serialize(template),
    });
  }

  @get('/:accountId/templates')
  async getTemplate(
    @params('accountId') accountId: string,
    @response() res: Response,
  ) {
    const account = await this.accountService.findById(accountId, null);
    const template = await this.accountTemplateService.getAccountTemplate(account);
    res.send({
      template: template ? await this.serializer.serialize(template) : null,
    });
  }

  @delete_('/:accountId/templates')
  async deleteTemplate(
    @params('accountId') accountId: string,
    @response() res: Response,
  ) {
    const account = await this.accountService.findById(accountId, null);
    const template = await this.accountTemplateService.getAccountTemplate(account);
    await this.accountTemplateService.removeTemplates([template], null);
    res.send();
  }

  @get('/:accountId/templates/file')
  async getAccountTemplateFile(
    @params('accountId') accountId: string,
    @response() res: Response,
  ) {
    const account = await this.accountService.findById(accountId, null);
    const template = await this.accountTemplateService.getAccountTemplate(account);
    const stream = await this.documentsStore.readFile(template.s3FilePath);
    const fileName = template.originalFileName;
    res.setHeader('content-type', '');
    res.setHeader('Content-Disposition', `"attachment;filename=${fileName}"`);
    stream.pipe(res);
  }

  @delete_('/:accountId')
  async removeAccount(
    @params('accountId') accountId: string,
    @response() res: Response,
  ) {
    const account = await this.accountService.findById(accountId, null);

    // Delete Deals
    const deals = await account.deals;
    await map(deals, async (deal: Deal) => {
      await this.dealManager.veryUnsafeRemoveDeal(deal, null);
    });

    await this.accountManager.deleteAccount(account, null);
    res.send();
  }
}
