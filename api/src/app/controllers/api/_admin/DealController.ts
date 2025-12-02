import { controller, get, params, response } from '../../../../framework/plugins/WebPlugin';
import { inject } from '../../../boot';
import { SerializerService } from '../../../../framework/plugins/SerializerPlugin';
import { DealManager, DealsReportRow } from '../../../service/manager/DealManager';
import { Response } from 'express';
import { AccountManager } from '../../../service/manager/AccountManager';
import { DocumentService } from '../../../service/entity/DocumentService';
import { Deal } from '../../../db/entity/Deal';
import { DealService } from '../../../service/entity/DealService';
import { Document } from '../../../db/entity/Document';
import { storage } from '../../../../framework/plugins/FileStoragePlugin/decorator/storage';
import { AbstractStorage } from '../../../../framework/plugins/FileStoragePlugin/storage/AbstractStorage';
import { DateTime } from 'luxon';


@controller({
  route: '/api/_admin/deals',
  middlewares: ['security.auth.superAdminJwt'],
})
export class DealController {
  constructor(
    @inject(SerializerService) private readonly serializer: SerializerService,
    @inject(DealManager) private readonly dealManager: DealManager,
    @inject(AccountManager) private readonly accountManager: AccountManager,
    @inject(DealService) private readonly dealService: DealService,
    @inject(DocumentService) private readonly documentService: DocumentService,
    @storage('dealDocuments') private readonly documentsStore: AbstractStorage,
  ) {}

  @get('/:accountId/deals')
  async getAccountDeals(
    @params('accountId') accountId: string,
    @response() res: Response,
  ) {
    const account = await this.accountManager.getAccount(accountId, null);
    const deals = await this.dealManager.getAllDeals(account, null, false, null);
    res.send({
      deals: await this.serializer.serialize(deals, { groups: ['withAssignee', 'withOwner'] }),
    });
  }

  @get('/:dealId/documents')
  async getDealDocuments(
    @params('dealId') dealId: string,
    @response() res: Response,
  ) {
    const deal: Deal = await this.dealService.findById(dealId, null);
    const documents: Document[] = await this.documentService.getDealDocuments(deal, null);
    res.send({
      documents: await this.serializer.serialize(documents),
    });
  }

  @get('/documents/:documentId')
  async getDealDocumentFile(
    @params('documentId') documentId: string,
    @response() res: Response,
  ) {
    const document: Document = await this.documentService.findById(documentId, null);
    const stream = await this.documentsStore.readFile(document.storagePath);
    const fileName = document.name;
    res.setHeader('content-type', fileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : '');
    res.setHeader('Content-Disposition', `"attachment;filename=${fileName}"`);
    stream.pipe(res);
  }

  @get('/download/report')
  async getDealsReport(
    @response() res: Response,
  ) {
    const allAccounts = await this.accountManager.getAllAccounts();
    const reportData = await this.dealManager.getAllDealsReportData(allAccounts);
    const reportCsv = [
      ['Account Id', 'Account Name', 'Deal Id', 'Deal Name', 'Deal Slug', 'Status', 'Created At', 'Updated At'],
    ];
    reportData.forEach((row: DealsReportRow) => {
      reportCsv.push([
        row.accountId, row.accountName,
        row.dealId, row.dealName, row.dealSlug, row.dealStatus,
        row.createdAt, row.updatedAt,
      ]);
    });
    const reportCsvText = reportCsv.map((row) => row.map((item) => `"${item}"`).join(',')).join('\n');

    const d = DateTime.now().toLocaleString(DateTime.DATE_SHORT);
    res.setHeader('content-type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment;filename=DealsReport_${d}.csv`);
    res.send(reportCsvText);
  }
}
