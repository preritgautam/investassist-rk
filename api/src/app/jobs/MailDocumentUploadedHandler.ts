import { AbstractJobHandler } from '../../framework/plugins/JobPlugin/AbstractJobHandler';
import { inject, injectable } from '../boot';
import { Job } from '../../framework/plugins/JobPlugin/models/Job';
import { MailService } from '../../framework/plugins/MailerPlugin/service/MailService';
import { all } from 'radash';
import { DealService } from '../service/entity/DealService';
import { DocumentService } from '../service/entity/DocumentService';
import { Account } from '../db/entity/Account';
import { Deal } from '../db/entity/Deal';
import { Document } from '../db/entity/Document';
import { AccountUser } from '../db/entity/AccountUser';
import { DocumentManager } from '../service/manager/DocumentManager';
import { MailsManager } from '../service/MailsManager';
import { AccountUserManager } from '../service/manager/AccountUserManager';
import { AccountManager } from '../service/manager/AccountManager';

@injectable({ alias: 'job.mail.document.uploaded.handler' })
export class MailDocumentUploadedHandler extends AbstractJobHandler {
  constructor(
    @inject(MailService) private readonly mailService: MailService,
    @inject(MailsManager) private readonly mailsManager: MailsManager,
    @inject(DealService) private readonly dealService: DealService,
    @inject(DocumentService) private readonly documentService: DocumentService,
    @inject(AccountUserManager) private readonly accountUserManager: AccountUserManager,
    @inject(AccountManager) private readonly accountManager: AccountManager,
    @inject(DocumentManager) private readonly documentManager: DocumentManager,
  ) {
    super();
  }

  async handleJob(job: Job) {
    const { documentId, userId, dealId, accountId } = job.data;
    // let deal: Deal; let document: Document; let user: AccountUser;
    // @ts-ignore
    const [deal, document, user, account]: [Deal, Document, AccountUser, Account] = await all([
      this.dealService.findById(dealId, null),
      this.documentService.findById(documentId, null),
      this.accountUserManager.getAccountUser(userId, null),
      this.accountManager.getAccount(accountId, null),
    ]);


    try {
      const { stream } = await this.documentManager.getDealDocumentFile(user, dealId, documentId, null);

      const mailData = await this.mailsManager.documentUploadedAdminMailData(
        user,
        account,
        deal,
        document,
        stream,
      );

      await this.mailService.sendMail(mailData).catch(console.error);
    } catch (e) {
      console.error(e);
    }
  }
}
