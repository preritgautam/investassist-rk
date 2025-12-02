import { EntityService } from '../../../bootstrap/service/entity/EntityService';
import { AccountTemplate } from '../../db/entity/AccountTemplate';
import { Account } from '../../db/entity/Account';
import { storage } from '../../../framework/plugins/FileStoragePlugin/decorator/storage';
import { AbstractStorage } from '../../../framework/plugins/FileStoragePlugin/storage/AbstractStorage';
import { randomUUID } from 'crypto';
import * as fsPromises from 'fs/promises';
import { map } from 'radash';
import { injectable } from '../../boot';
import { TxnOption } from '../../../framework/plugins/TypeORMPlugin/Transaction';

const ModelFilePath = '__ModelFiles__';

export interface AddAccountTemplateParams {
  name: string;
  chartOfAccount: string;
  modelFile: Express.Multer.File;
}

@injectable()
export class AccountTemplateService extends EntityService<AccountTemplate> {
  constructor(
    @storage('dealDocuments') private readonly documentsStore: AbstractStorage,
  ) {
    super(AccountTemplate);
  }

  private async uploadFile(template: AccountTemplate, file: Express.Multer.File) {
    const fileBuffer: Buffer = await fsPromises.readFile(file.path);
    await this.documentsStore.createFile(template.s3FilePath, fileBuffer, {});
  }

  private async deleteFile(template: AccountTemplate) {
    await this.documentsStore.deleteFile(template.s3FilePath, {});
  }

  async removeTemplates(templates: AccountTemplate[], txn: TxnOption) {
    await map(templates, async (template: AccountTemplate) => {
      await this.deleteFile(template);
      await this.delete(template, txn);
    });
  }

  async addAccountTemplate(account: Account, params: AddAccountTemplateParams): Promise<AccountTemplate> {
    // delete any existing templates to make sure we have only one as of now
    const templates = await account.templates;
    await this.removeTemplates(templates, null);

    const template = new AccountTemplate();
    template.name = params.name;
    template.chartOfAccount = JSON.parse(params.chartOfAccount);
    template.originalFileName = params.modelFile.originalname;
    template.account = Promise.resolve(account);
    template.s3FilePath = `${account.id}/${ModelFilePath}/${randomUUID()}-${params.modelFile.originalname}`;

    await this.uploadFile(template, params.modelFile);
    return this.save(template, null);
  }

  async getAccountTemplate(account: Account): Promise<AccountTemplate> {
    const templates = await account.templates;
    return templates.length > 0 ? templates[0] : null;
  }

  async getAccountTemplateFileStream(account: Account) {
    const template = await this.getAccountTemplate(account);
    return this.documentsStore.readFile(template.s3FilePath);
  }
}
