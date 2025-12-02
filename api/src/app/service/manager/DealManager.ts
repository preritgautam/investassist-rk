import { inject, injectable } from '../../boot';
import { CreateDealParams, DealService } from '../entity/DealService';
import { EventDispatcher } from '../../../framework/plugins/EventPlugin';
import { Account } from '../../db/entity/Account';
import { AccountUser } from '../../db/entity/AccountUser';
import { DealDictionary } from '../../db/entity/DealDictionary';
import { transactional } from '../../../framework/plugins/TypeORMPlugin/decorators/transactional';
import { TxnOption } from '../../../framework/plugins/TypeORMPlugin/Transaction';
import { DealCreatedEvent, DealUpdatedEvent } from '../../events/dealEvents';
import { Deal } from '../../db/entity/Deal';
import slugify from 'slugify';
import { storage } from '../../../framework/plugins/FileStoragePlugin/decorator/storage';
import { AbstractStorage } from '../../../framework/plugins/FileStoragePlugin/storage/AbstractStorage';
import { DocumentType } from '../../models/enums/DocumentType';
import { DocumentService } from '../entity/DocumentService';
import { Document } from '../../db/entity/Document';
import { DocumentExtractionManager } from './DocumentExtractionManager';
import { DealDetails } from '../../db/entity/DealDetails';
import { DealStatus } from '../../models/enums/DealStatus';
import { Assumption } from '../../db/entity/Assumption';
import { AssumptionManager } from './AssumptionManager';
import { DealDictionaryService } from '../entity/DealDictionaryService';
import { DictionaryData } from '../../types';
import { CFDataRow } from '../../types';
import { DealUtils } from './DealUtils';
import { AccountUserManager } from './AccountUserManager';
import { DealDetailsService } from '../entity/DealDetailsService';
import { DocumentManager } from './DocumentManager';
import { DocumentData } from '../../db/entity/DocumentData';
import { DocumentDataService } from '../entity/DocumentDataService';
import { ModelIntegrationService } from '../model/ModelIntegrationService';
import { DateTime } from 'luxon';
import { ModelDocument, ModelHistory } from '../../db/entity/ModelHistory';
import { ModelHistoryService } from '../entity/ModelHistoryService';
import * as fs from 'fs';
import { config } from '../../../framework/plugins/AppConfigPlugin/decorators/config';
import { AppConfigType } from '../../config';
import { parallel } from 'radash';

export type AddDealParams = Omit<CreateDealParams, 'account' | 'ownedByUser'>;

export interface UpdateDealParams extends Pick<Deal, 'name' | 'address' | 'slug'> {
  status: string,
  details: Partial<DealDetails>,
}

export interface UploadDealDocumentParams {
  user: AccountUser,
  dealId: string,
  fileDataUrl: string,
  fileName: string,
  documentType: DocumentType,
  startPage: number,
  endPage: number,
}

export interface ReprocessDocumentParams {
  user: AccountUser;
  dealId: string;
  documentId: string;
  startPage: number;
  endPage: number;
}

export interface DealMatch {
  dealId: string;
  dealName: string;
  matchPercent: number;
  matchCount: number;
}

export interface DealsReportRow {
  accountId: string;
  accountName: string;
  dealId: string;
  dealSlug: string;
  dealName: string;
  dealStatus: string;
  createdAt: string;
  updatedAt: string;
}

@injectable()
export class DealManager {
  constructor(
    @inject(DealService) private readonly dealService: DealService,
    @inject(EventDispatcher) private readonly eventDispatcher: EventDispatcher,
    @inject(DocumentService) private readonly documentService: DocumentService,
    @storage('dealDocuments') private readonly documentsStore: AbstractStorage,
    @inject(DocumentExtractionManager) private readonly extractionManager: DocumentExtractionManager,
    @inject(DealDictionaryService) private readonly dealDictionaryService: DealDictionaryService,
    @inject(AssumptionManager) private readonly assumptionManager: AssumptionManager,
    @inject(DealUtils) private readonly dealUtils: DealUtils,
    @inject(AccountUserManager) private readonly accountUserManager: AccountUserManager,
    @inject(DealDetailsService) private readonly dealDetailsService: DealDetailsService,
    @inject(DocumentManager) private readonly documentManager: DocumentManager,
    @inject(DocumentDataService) private readonly documentDataService: DocumentDataService,
    @inject(ModelIntegrationService) private readonly modelIntegrationService: ModelIntegrationService,
    @inject(ModelHistoryService) private readonly modelHistoryService: ModelHistoryService,
    @config('modelIntegration') private readonly modelIntegrationConfig: AppConfigType['modelIntegration'],
  ) {
  }

  @transactional()
  async addDeal(account: Account, user: AccountUser, params: AddDealParams, txn: TxnOption): Promise<Deal> {
    const preferredSlug = slugify(params.name, { lower: true });
    const slug = await this.dealService.getValidSlug(account, preferredSlug);

    const deal = await this.dealService.createDeal({
      ...params,
      slug,
      account: Promise.resolve(account),
      ownedByUser: Promise.resolve(user),
      assignedToUser: Promise.resolve(user),
    }, txn);

    await this.eventDispatcher.dispatch(new DealCreatedEvent(deal));
    return deal;
  }

  async updateDeal(
    dealId: string,
    user: AccountUser,
    params: UpdateDealParams,
    txn: TxnOption,
  ): Promise<Deal> {
    const deal = await this.dealUtils.getUserDeal(dealId, user, txn);
    const updateParams = {
      ...params,
      status: params.status ? DealStatus.get(params.status) : undefined,
    };
    await this.dealService.updateDeal(deal, updateParams, txn);
    await this.eventDispatcher.dispatch(new DealUpdatedEvent(deal));
    return deal;
  }

  async getAllDeals(
    account: Account, user?: AccountUser, includeSampleDeals: boolean = true, txn: TxnOption = undefined,
  ): Promise<Deal[]> {
    let deals: Deal[];
    if (!user) {
      deals = await this.dealService.getAccountDeals(account, txn);
    } else if (user.roles.includes('Admin')) {
      deals = await this.dealService.getAccountDeals(account, txn);
    } else {
      deals = await this.dealService.getUserDeals(user, txn);
    }


    deals.sort((d1, d2) => {
      // New Deals -> In Progress Deals -> Completed Deals
      if (d1.status !== d2.status) {
        return d1.status.sortOrder - d2.status.sortOrder;
      }

      // for same status sort by reverse updated date
      return d2.updatedAt.getTime() - d1.updatedAt.getTime();
    });

    if (includeSampleDeals) {
      const sampleDeals = await this.dealService.getSampleDeals(txn);
      return [...sampleDeals, ...deals];
    }

    return deals;
  }

  async removeDeal(dealId: string, user: AccountUser, txn: TxnOption): Promise<Deal> {
    const deal = await this.dealUtils.getUserDeal(dealId, user, txn);
    const dealDocuments: Document[] = await this.documentService.getDealDocuments(deal, txn);
    for (const document of dealDocuments) {
      await this.documentManager.deleteDealDocument(user, dealId, document.id, true, txn);
    }
    // deal dictionary and deal details will be deleted with the deal
    await this.dealService.delete(deal, txn);
    return deal;
  }

  async veryUnsafeRemoveDeal(deal: Deal, txn: TxnOption) {
    const dealDocuments: Document[] = await deal.documents;
    for (const document of dealDocuments) {
      await this.documentManager.veryUnsafeDeleteDocument(document.id, txn);
    }
    // deal dictionary and deal details will be deleted with the deal
    await this.dealService.delete(deal, txn);
  }

  private updateDictionaryWithDocument(dealDictionary: DealDictionary, documentData: DocumentData) {
    if (documentData) {
      const dictionaryLineItems = new Set<string>(dealDictionary.lineItems ?? []);
      const dictionary: DictionaryData = dealDictionary.dictionary ?? {};
      const dataRows = documentData.editedData.rows as CFDataRow[];
      dataRows.forEach((row: CFDataRow) => {
        dictionaryLineItems.add(row.lineItem);
        dictionary[row.lineItem] = {
          head: row.head,
          category: row.category,
        };
        if (row.extractCat) {
          dictionary[`${row.lineItem}_|_${row.extractCat}`] = {
            head: row.head,
            category: row.category,
          };
        }
      });
      dealDictionary.dictionary = dictionary;
      dealDictionary.lineItems = [...dictionaryLineItems];
    }
  }

  async applyDealDictionaryToDocument(document: Document, txn: TxnOption) {
    if (document.documentType === DocumentType.CF) {
      const deal = await document.deal;
      const dealDictionary = (await deal.dealDictionary) ?? new DealDictionary();
      const documentData = await document.documentData;
      const dataRows = documentData.editedData.rows as CFDataRow[];
      const dictionary = dealDictionary.dictionary ?? {};

      dataRows.forEach((row: CFDataRow) => {
        const classification = dictionary[`${row.lineItem}_|_${row.extractCat}`] ?? dictionary[row.lineItem];
        if (classification) {
          row.head = classification.head;
          row.category = classification.category;
        }
      });

      await this.documentDataService.save(documentData, txn);
    }
  }

  async updateDealDictionary(document: Document, txn: TxnOption) {
    if (document.documentType === DocumentType.CF) {
      const deal = await document.deal;
      const dealDictionary = (await deal.dealDictionary) ?? new DealDictionary();
      this.updateDictionaryWithDocument(dealDictionary, await document.documentData);
      deal.dealDictionary = Promise.resolve(dealDictionary);
      await this.dealDictionaryService.save(dealDictionary, txn);
      await this.dealService.save(deal, txn);
    }
  }

  async rebuildDealDictionary(deal: Deal, txn: TxnOption) {
    const dealDictionary = (await deal.dealDictionary) ?? new DealDictionary();
    dealDictionary.dictionary = {};
    dealDictionary.lineItems = [];
    const cashFlows = await deal.cashFlows;
    for (const cashFlow of cashFlows) {
      this.updateDictionaryWithDocument(dealDictionary, await cashFlow.documentData);
    }
    deal.dealDictionary = Promise.resolve(dealDictionary);
    await this.dealDictionaryService.save(dealDictionary, txn);
    await this.dealService.save(deal, txn);
  }

  async assignDeal(user: AccountUser, dealId: string, assignedToUser: AccountUser, txn: TxnOption):
    Promise<Deal> {
    const deal = await this.dealUtils.getUserDeal(dealId, user, txn);
    deal.assignedToUser = Promise.resolve(assignedToUser);
    return await this.dealService.save(deal, txn);
  }

  @transactional()
  async addOrUpdateDealAssumptions(
    dealId: string, user: AccountUser, assumptionParams: Partial<Assumption>, txn: TxnOption,
  ): Promise<Assumption> {
    const deal = await this.dealUtils.getUserDeal(dealId, user, txn);
    return this.assumptionManager.addOrUpdateDealAssumption(deal, assumptionParams, txn);
  }

  async getDealAssumption(dealId: string, user: AccountUser, txn: TxnOption) {
    const deal = await this.dealUtils.getUserDeal(dealId, user, txn, 'READ');
    return this.assumptionManager.getDealAssumption(deal, txn);
  }

  async getMatchingDeals(dealId: string, user: AccountUser, txn: TxnOption) {
    const userDeals: Deal[] = await this.getDealsToMatch(user, txn);
    const validDeals = userDeals.filter((deal) => deal.id !== dealId);
    const deal = await this.dealService.findById(dealId, txn);
    const dealDictionary = await deal.dealDictionary;
    const matchingDeals: DealMatch[] = [];

    for (const dealToMatch of validDeals) {
      const dictionary = (await dealToMatch.dealDictionary) ?? new DealDictionary();
      const dictionaryLineItemsSet = new Set(dictionary.lineItems ?? []);
      const matchCount = dealDictionary.lineItems.filter((li: string) => dictionaryLineItemsSet.has(li)).length;
      const matchObj: DealMatch = {
        dealId: dealToMatch.id,
        dealName: dealToMatch.name,
        matchCount,
        matchPercent: (matchCount * 100) / dealDictionary.lineItems.length,
      };
      matchingDeals.push(matchObj);
    }
    return matchingDeals;
  }

  async getDealsToMatch(user: AccountUser, txn: TxnOption): Promise<Deal[]> {
    return await this.getAllDeals(await user.account, user, true, txn);
  }

  async getDealDetails(user: AccountUser, dealId: string, txn: TxnOption): Promise<DealDetails> {
    const deal = await this.dealUtils.getUserDeal(dealId, user, txn, 'READ');
    return deal.details;
  }

  async ensureUserData(deal: Deal) {
    const owner = await deal.ownedByUser;
    const assignee = await deal.assignedToUser;
    await this.accountUserManager.ensureAccountUsersCGData([owner, assignee]);
  }

  async updateDealDetails(user: AccountUser, dealId: string, details: Partial<DealDetails>, txn: TxnOption) {
    const deal = await this.dealUtils.getUserDeal(dealId, user, txn);
    const dealDetails = await deal.details;
    this.dealDetailsService.copyDetails(dealDetails, details);
    await this.dealDetailsService.save(dealDetails, txn);
  }

  async getDealDictionary(user: AccountUser, dealId: string, txn: TxnOption): Promise<object> {
    const deal = await this.dealUtils.getUserDeal(dealId, user, txn);
    const dictionary = await deal.dealDictionary;
    return dictionary?.dictionary ?? {};
  }

  async generateDealModel(
    user: AccountUser,
    dealId: string,
    rentRollIds: string[],
    cashFlowIds: string[],
    addToModelHistory: boolean,
  ) {
    const deal = await this.dealUtils.getUserDeal(dealId, user, null, 'READ');

    if (deal.isSampleDeal) {
      return {
        fileData: fs.readFileSync(this.modelIntegrationConfig.sampleStaticModelFile),
        fileName: `${deal.name} - output - ${DateTime.now().toISO({ includeOffset: false })}.xlsx`,
      };
    }
    const account = await user.account;

    const dealModelData = await this.modelIntegrationService.getDealModelData(deal, rentRollIds, cashFlowIds);
    const fileData = await this.modelIntegrationService.generateDealModelFile(account, dealModelData);
    if (addToModelHistory) {
      await this.addModelHistory(deal, rentRollIds, cashFlowIds, dealModelData);
    }
    return {
      fileData,
      fileName: `${deal.name} - output - ${DateTime.now().toISO({ includeOffset: false })}.xlsm`,
    };
  }

  async addModelHistory(deal: Deal, rentRollIds: string[], cashFlowIds: string[], data: object): Promise<ModelHistory> {
    const documents: ModelDocument[] = [];
    const dealDocuments =
      await this.documentService.getDealDocumentsByIds(deal, [...rentRollIds, ...cashFlowIds], null);
    for (const document of dealDocuments) {
      documents.push({
        documentId: document.id,
        documentName: document.name,
        documentType: document.documentType,
        asOnDate: document?.asOnDate,
        periodStart: document?.periodFrom,
        periodEnd: document?.periodTo,
      });
    }

    return await this.modelHistoryService.addModelHistory({
      deal: Promise.resolve(deal),
      documents,
      modelData: data,
      name: `${deal.name}-${new Date().toISOString()}`,
    }, null);
  }

  async getDealModelHistory(user: AccountUser, dealId: string, txn: TxnOption): Promise<ModelHistory[]> {
    const deal = await this.dealUtils.getUserDeal(dealId, user, txn, 'READ');
    return await deal.modelHistories;
  }

  async generateDealModelHistory(
    user: AccountUser,
    dealId: string,
    modelHistoryId: string,
    txn: TxnOption,
  ) {
    const deal = await this.dealUtils.getUserDeal(dealId, user, null);
    const modelHistory = await this.modelHistoryService.getRepository(txn).createQueryBuilder('a')
      .where({
        deal: deal,
        id: modelHistoryId,
      })
      .getOneOrFail();
    const account = await user.account;
    const fileData = await this.modelIntegrationService.generateDealModelFile(account, modelHistory.modelData);
    return {
      fileData,
      fileName: `${deal.name} - output - ${DateTime.now().toISO({ includeOffset: false })}.xlsm`,
    };
  }

  async deleteDealModelHistory(
    user: AccountUser,
    dealId: string,
    modelHistoryId: string,
    txn: TxnOption,
  ) {
    const deal = await this.dealUtils.getUserDeal(dealId, user, null);
    const modelHistory = await this.modelHistoryService.getRepository(txn).createQueryBuilder('a')
      .where({
        deal: deal,
        id: modelHistoryId,
      })
      .getOneOrFail();
    await this.modelHistoryService.delete(modelHistory, txn);
    return modelHistory;
  }

  async getAllDealsReportData(allAccounts: Account[]) {
    const dealsReport: DealsReportRow[] = [];
    const getAccountDeals = async (account: Account) => {
      const accountDeals = await account.deals;
      const accountDealsReport: DealsReportRow[] = [];
      accountDeals.forEach((deal: Deal) => {
        accountDealsReport.push({
          accountId: account.id,
          accountName: account.name ?? 'Different CG Account',
          dealId: deal.id,
          dealSlug: deal.slug,
          dealName: deal.name,
          dealStatus: deal.status.label,
          createdAt: DateTime.fromJSDate(deal.createdAt).toISO(),
          updatedAt: DateTime.fromJSDate(deal.updatedAt).toISO(),
        });
      });
      dealsReport.push(...accountDealsReport);
    };
    await parallel(3, allAccounts, getAccountDeals);
    return dealsReport;
  }
}
