import { inject, injectable } from '../../boot';
import { ExtractDocumentParams, MLExtractionService } from '../ml/MLExtractionService';
import { Document } from '../../db/entity/Document';
import { MLResponseParser } from '../ml/MLResponseParser';
import { JobsService } from '../../../framework/plugins/JobPlugin/JobsService';
import { TxnOption } from '../../../framework/plugins/TypeORMPlugin/Transaction';
import { DocumentStatus } from '../../models/enums/DocumentStatus';
import { DocumentService } from '../entity/DocumentService';
import { AssetType } from '../../models/enums/AssetType';
import { storage } from '../../../framework/plugins/FileStoragePlugin/decorator/storage';
import { AbstractStorage } from '../../../framework/plugins/FileStoragePlugin/storage/AbstractStorage';
import { DocumentData } from '../../db/entity/DocumentData';
import { DealDocumentProcessedEvent } from '../../events/dealDocumentsEvents';
import { EventDispatcher } from '../../../framework/plugins/EventPlugin';
import { transactional } from '../../../framework/plugins/TypeORMPlugin/decorators/transactional';
import { DocumentType } from '../../models/enums/DocumentType';
import { DocumentDataService } from '../entity/DocumentDataService';
import { ParsedCFResponse } from '../ml/CFResponseParser';
import { COA } from '../../db/entity/AccountTemplate';
import { Classifier, LineItemType } from '../ml/classifier/Classifier';
import { CFDataRow } from '../../types';

@injectable()
export class DocumentExtractionManager {
  constructor(
    @inject(MLExtractionService) private readonly extractionService: MLExtractionService,
    @inject(MLResponseParser) private readonly responseParser: MLResponseParser,
    @inject(DocumentService) private readonly documentService: DocumentService,
    @inject(DocumentDataService) private readonly documentDataService: DocumentDataService,
    @inject(JobsService) private readonly jobs: JobsService,
    @inject(EventDispatcher) private readonly eventDispatcher: EventDispatcher,
    @storage('dealDocuments') private readonly documentsStore: AbstractStorage,
    @inject(Classifier) private readonly classifier: Classifier,
  ) {
  }

  // noinspection SpellCheckingInspection
  private static yyyymmToMmddyyyy(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    return `${parts[1]}/01/${parts[0]}`;
  }

  private async prepareExtractionParams(document: Document): Promise<ExtractDocumentParams> {
    return {
      documentType: document.documentType,
      from: document.startPage ? document.startPage : undefined,
      to: document.endPage ? document.endPage : undefined,
      assetType: AssetType.Multifamily,
      fileName: document.name,
      file: await this.documentsStore.readFile(document.storagePath),
    };
  }

  async scheduleDocumentExtractionJob(document: Document) {
    document.status = DocumentStatus.Processing;
    await this.documentService.save(document, null);
    this.jobs.dispatch('extract.document', { documentId: document.id }).catch(console.error);
  }

  async triggerDocumentExtraction(document: Document) {
    document.status = DocumentStatus.Processing;
    await this.documentService.save(document, null);
    // Let the current transaction complete so that we have an entity to use
    process.nextTick(() => this.extractDocument(document.id, null).catch((e) => console.error(e)));
  }

  @transactional()
  async extractDocument(documentId: string, txn: TxnOption = null) {
    let document: Document;
    try {
      document = await this.documentService.findById(documentId, txn);
      const params = await this.prepareExtractionParams(document);
      const mlResponse = await this.extractionService.extractDocument(params);
      const response = this.responseParser.parseResponse(params, mlResponse);

      if (document.documentType === DocumentType.CF) {
        await this.reclassifyLineItemsIfNeeded(document, response as ParsedCFResponse);
      }

      let documentData = await document.documentData;
      if (!documentData) {
        documentData = new DocumentData();
      }

      documentData.editedData = response.extracted;
      documentData.mlResponse = mlResponse;
      documentData.sourceData = {};
      documentData.extractedData = response.extracted;

      if (document.documentType === DocumentType.CF) {
        document.periodFrom = mlResponse.period_from;
        document.periodTo = mlResponse.period_to;
      }
      if (document.documentType === DocumentType.RRF) {
        document.asOnDate = mlResponse.as_on_date;
      }

      document.status = DocumentStatus.Processed;
      document.documentData = Promise.resolve(documentData);

      await this.documentDataService.save(documentData, txn);
      await this.documentService.save(document, txn);
      this.eventDispatcher.dispatch(new DealDocumentProcessedEvent(document)).catch(console.error);
    } catch (e) {
      if (document) {
        document.status = DocumentStatus.Failed;
        document.documentData = null;
        await this.documentService.save(document, txn);
      } else {
        throw e;
      }
    }
  }

  private async reclassifyLineItemsIfNeeded(document: Document, response: ParsedCFResponse) {
    const deal = await document.deal;
    const account = await deal.account;
    const templates = await account.templates;
    if (!templates.length) {
      // No template added, do nothing
      return;
    }

    const coa = templates[0].chartOfAccount.items.map((c: COA) => {
      return `${c.head} | ${c.category} | ${c.subCategory}`;
    });

    const lastIndex = response.extracted.columns.length - 1;
    let amountCol: string;
    for (let i = lastIndex; i >= 0; i--) {
      if (response.extracted.columns[i].key.startsWith('col')) {
        amountCol = response.extracted.columns[i].key;
        break;
      }
    }

    const lineItems: LineItemType[] = response.extracted.rows.map((r: CFDataRow) => {
      return {
        lineItem: r.lineItem,
        amount: r[amountCol],
      };
    });

    const classifiedLineItems = await this.classifier.classifyLineItems(lineItems, coa);

    response.extracted.rows.forEach((row: CFDataRow, i) => {
      row.head = classifiedLineItems[i].head === 'NA' ? '' : classifiedLineItems[i].head;
      row.category = classifiedLineItems[i].category === 'NA' ? '' : classifiedLineItems[i].category;
    });
  }
}
