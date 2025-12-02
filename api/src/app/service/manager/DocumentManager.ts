import { inject, injectable } from '../../boot';
import { Document } from '../../db/entity/Document';
import { DocumentDataService } from '../entity/DocumentDataService';
import { TxnOption } from '../../../framework/plugins/TypeORMPlugin/Transaction';
import {
  ChargeCodeConfig,
  ExtractedData,
  OccupancyConfig,
  FPConfig,
  FloorPlan,
  RRFColumn,
  RRFDataColumn,
  RRFDataRow,
  RRFExtractedData, RenovationConfiguration, AffordableConfiguration, TicketDetails, MtmConfiguration,
} from '../../types';
import { matchChargeCode } from '../ml/constants/DefaultChargeCodeMapping';
import { AccountUser } from '../../db/entity/AccountUser';
import { DealUtils } from './DealUtils';
import { transactional } from '../../../framework/plugins/TypeORMPlugin/decorators/transactional';
import { DealDocumentDataUpdatedEvent, DealDocumentDeletedEvent } from '../../events/dealDocumentsEvents';
import { DocumentService } from '../entity/DocumentService';
import { EventDispatcher } from '../../../framework/plugins/EventPlugin';
import { storage } from '../../../framework/plugins/FileStoragePlugin/decorator/storage';
import { AbstractStorage } from '../../../framework/plugins/FileStoragePlugin/storage/AbstractStorage';
import { randomUUID } from 'crypto';
import { DocumentUploadError } from '../../errors/DocumentUploadError';
import { ReprocessDocumentParams, UploadDealDocumentParams } from './DealManager';
import { DocumentExtractionManager } from './DocumentExtractionManager';
import { Buffer } from 'buffer';
import { DocumentData } from '../../db/entity/DocumentData';
import { RRUnitInformationField } from '../../models/enums/RentRollFieldEnum';
import { matchOccupancy } from '../ml/constants/DefaultOccupancyMapping';
import { DefaultFloorPlanMapping } from '../ml/constants/DefaultFloorPlanMapping';
import { DocumentStatus } from '../../models/enums/DocumentStatus';
import { AccountUserManager } from './AccountUserManager';
import { AccountManager } from './AccountManager';
import { MailsManager } from '../MailsManager';
import { MailService } from '../../../framework/plugins/MailerPlugin/service/MailService';

function dataUrlToBuffer(dataUrl: string): Buffer {
  const base64 = dataUrl.split(';base64,').pop();
  return Buffer.from(base64, 'base64');
}

@injectable()
export class DocumentManager {
  constructor(
    @inject(DocumentDataService) private readonly documentDataService: DocumentDataService,
    @inject(DocumentService) private readonly documentService: DocumentService,
    @inject(DealUtils) private readonly dealUtils: DealUtils,
    @inject(EventDispatcher) private readonly eventDispatcher: EventDispatcher,
    @storage('dealDocuments') private readonly documentsStore: AbstractStorage,
    @inject(DocumentExtractionManager) private readonly extractionManager: DocumentExtractionManager,
    @inject(AccountUserManager) private readonly auManager: AccountUserManager,
    @inject(AccountManager) private readonly accountManager: AccountManager,
    @inject(MailsManager) private readonly mailsManager: MailsManager,
    @inject(MailService) private readonly mailService: MailService,
  ) {
  }

  @transactional()
  async uploadDealDocument(
    params: UploadDealDocumentParams,
    txn?: TxnOption,
  ): Promise<Document> {
    const fileData = dataUrlToBuffer(params.fileDataUrl);
    let error;

    try {
      const deal = await this.dealUtils.getUserDeal(params.dealId, params.user, txn);
      const account = await deal.account;
      this.accountManager.ensureAccountIsNotFree(account);
      const fileLocation = `${account.id}/${deal.id}`;
      const fileName = `${randomUUID()}-${params.fileName}`;
      const filePath = `${fileLocation}/${fileName}`;
      await this.documentsStore.createFile(filePath, fileData, {});

      try {
        const document = await this.documentService.createDocument({
          deal: Promise.resolve(deal),
          name: params.fileName,
          documentType: params.documentType,
          storagePath: filePath,
          startPage: params.startPage,
          endPage: params.endPage,
        }, txn);
        // await this.extractionManager.triggerDocumentExtraction(document, txn);
        return document;
      } catch (e) {
        error = e;
        await this.documentsStore.deleteFile(fileName, {});
      }
    } catch (e) {
      throw new DocumentUploadError(`There was an error in uploading document file to storage: ${e.toString()}`);
    }

    throw new DocumentUploadError(`There was an error in creating document record: ${error.toString()}`);
  }

  public async mapChargeCodes(document: Document, txn: TxnOption) {
    const deal = await document.deal;
    const documentData = await document.documentData;
    const rentRolls = await deal.rentRolls;
    const otherRentRolls = rentRolls.filter((rr) => rr.id !== document.id);

    // build a mapping from other rent rolls in the deal
    let otherRentRollsChargeCodeMapping: ChargeCodeConfig = {};
    for (const anotherRentRoll of otherRentRolls) {
      const rrDocumentData = await anotherRentRoll.documentData;
      if (rrDocumentData?.chargeCodeConfig) {
        otherRentRollsChargeCodeMapping = { ...otherRentRollsChargeCodeMapping, ...rrDocumentData.chargeCodeConfig };
      }
    }

    const currentChargeCodeConfig = documentData.chargeCodeConfig ?? {};

    const chargeCodeConfig = (documentData.editedData.columns as RRFColumn[])
      .filter((column: RRFDataColumn) => column.type === 'chargeCode' && !column.discard)
      .reduce((chargeCodeConfig, column) => {
        chargeCodeConfig[column.name] =
          currentChargeCodeConfig[column.name] ??
          otherRentRollsChargeCodeMapping[column.name] ??
          matchChargeCode(column.name)?.key ??
          '';

        return chargeCodeConfig;
      }, {});

    documentData.chargeCodeConfig = chargeCodeConfig;
    await this.documentDataService.save(documentData, txn);
  }

  public async mapOccupancy(document: Document, txn: TxnOption) {
    const deal = await document.deal;
    const documentData = await document.documentData;
    const editedData: RRFExtractedData = documentData.editedData as RRFExtractedData;
    const occupancyColumn = editedData.columns.find(
      (column: RRFDataColumn) => column.name === RRUnitInformationField.status.key && !column.discard,
    );

    if (occupancyColumn) {
      const rentRolls = await deal.rentRolls;
      const otherRentRolls = rentRolls.filter((rr) => rr.id !== document.id);

      // build a mapping from other rent rolls in the deal
      let otherRentRollsOccupancyMapping: OccupancyConfig = {};
      for (const anotherRentRoll of otherRentRolls) {
        const rrDocumentData = await anotherRentRoll.documentData;
        if (rrDocumentData?.occupancyConfig) {
          otherRentRollsOccupancyMapping = { ...otherRentRollsOccupancyMapping, ...rrDocumentData.occupancyConfig };
        }
      }

      const currentOccupancyConfig = documentData.occupancyConfig ?? {};

      const occupancyValues = new Set<string>(
        editedData.rows.map((row: RRFDataRow) => row[occupancyColumn.key] as string),
      );

      const occupancyConfig: OccupancyConfig = {};
      for (let occupancy of occupancyValues) {
        occupancy = occupancy ?? '';
        occupancyConfig[occupancy] =
          currentOccupancyConfig[occupancy] ??
          otherRentRollsOccupancyMapping[occupancy] ??
          matchOccupancy(occupancy.toLowerCase())?.key ??
          '';
      }
      documentData.occupancyConfig = occupancyConfig;
      await this.documentDataService.save(documentData, txn);
    }
  }


  public async mapFloorPlans(document: Document, txn: TxnOption) {
    const deal = await document.deal;
    const documentData = await document.documentData;
    const editedData: RRFExtractedData = documentData.editedData as RRFExtractedData;
    const floorPlanColumn = editedData.columns.find(
      (column: RRFDataColumn) => column.name === RRUnitInformationField.floorPlan.key && !column.discard,
    ) ?? editedData.columns.find(
      (column: RRFDataColumn) => column.name === RRUnitInformationField.unitType.key && !column.discard,
    ) ?? editedData.columns.find(
      (column: RRFDataColumn) => column.name === RRUnitInformationField.sqFt.key && !column.discard,
    );

    if (floorPlanColumn) {
      const rentRolls = await deal.rentRolls;
      const otherRentRolls = rentRolls.filter((rr) => rr.id !== document.id);

      // build a mapping from other rent rolls in the deal
      let otherRentRollsFPMapping: FPConfig = {};
      for (const anotherRentRoll of otherRentRolls) {
        const rrDocumentData = await anotherRentRoll.documentData;
        if (rrDocumentData?.floorPlanConfig) {
          otherRentRollsFPMapping = { ...otherRentRollsFPMapping, ...rrDocumentData.floorPlanConfig };
        }
      }

      const currentFPConfig = documentData.floorPlanConfig ?? {};

      const fpValues = new Set<string>(
        editedData.rows.map((row: RRFDataRow) => row[floorPlanColumn.key] as string),
      );

      const fpConfig: FPConfig = {};
      for (let fp of fpValues) {
        fp = fp ?? '';
        const config: FloorPlan = currentFPConfig[fp] ??
          otherRentRollsFPMapping[fp] ??
          DefaultFloorPlanMapping[fp] ??
          { beds: '', baths: '', tenantType: 'Residential', renameFloorPlan: '' };
        fpConfig[fp] = {
          beds: config.beds,
          baths: config.baths,
          tenantType: config.tenantType,
          renameFloorPlan: (config.beds ?
            config.beds === 'studio' ? 'Studio' : `${config.beds} Bed - ${config.baths} Bath` :
            config.renameFloorPlan) || '',
        };
      }

      documentData.floorPlanConfig = fpConfig;
      await this.documentDataService.save(documentData, txn);
    }
  }

  @transactional()
  async deleteDealDocument(
    user: AccountUser,
    dealId: string,
    documentId: string,
    deleteDeal: boolean = false,
    txn: TxnOption = null,
  ) {
    const deal = await this.dealUtils.getUserDeal(dealId, user, txn);
    const document = await this.documentService.getDealDocument(deal, documentId, txn);
    const documentData = await document.documentData;
    if (documentData !== null) {
      await txn.transactionalManager.remove(documentData);
    }
    await this.documentService.delete(document, txn);
    await this.documentsStore.deleteFile(document.storagePath, {});
    this.eventDispatcher.dispatch(new DealDocumentDeletedEvent(deal, document, deleteDeal)).catch(console.error);
  }

  async veryUnsafeDeleteDocument(documentId: string, txn: TxnOption) {
    const document = await this.documentService.findById(documentId, txn);
    await this.documentsStore.deleteFile(document.storagePath, {});
    await this.documentService.delete(document, txn);
  }

  async getDealDocumentUrl(
    user: AccountUser, dealId: string, documentId: string, txn: TxnOption,
  ): Promise<string> {
    const document = await this.dealUtils.getDealDocument(user, dealId, documentId, txn, 'READ');
    return await this.documentsStore.getUrl(document.storagePath, { expiresIn: 3600 });
  }

  @transactional()
  async reprocessDocument(params: ReprocessDocumentParams, txn: TxnOption) {
    const document = await this.dealUtils.getDealDocument(params.user, params.dealId, params.documentId, txn, 'WRITE');

    document.startPage = params.startPage;
    document.endPage = params.endPage;
    // Note: Relying on the below call to save the document
    await this.extractionManager.scheduleDocumentExtractionJob(document);
  }

  async getDealDocumentFile(user: AccountUser, dealId: string, documentId: string, txn: TxnOption) {
    const document = await this.dealUtils.getDealDocument(user, dealId, documentId, txn, 'READ');
    const stream = await this.documentsStore.readFile(document.storagePath);
    return {
      stream,
      fileName: document.name,
    };
  }

  async getDocumentData(user: AccountUser, dealId: string, documentId: string, txn: TxnOption): Promise<DocumentData> {
    const document = await this.dealUtils.getDealDocument(user, dealId, documentId, txn, 'READ');
    return document.documentData;
  }

  async updateDocumentData(
    user: AccountUser, dealId: string, documentId: string, editedData: ExtractedData, txn: TxnOption,
  ) {
    const document = await this.dealUtils.getDealDocument(user, dealId, documentId, txn, 'WRITE');
    const documentData = await document.documentData;
    documentData.editedData = editedData;
    await this.documentDataService.save(documentData, txn);
    this.documentService.updateDocumentPeriod(document, documentData);
    const savedDocument = await this.documentService.save(document, txn);
    this.eventDispatcher.dispatch(new DealDocumentDataUpdatedEvent(savedDocument)).catch(console.error);
  }

  async renameDealDocument(user: AccountUser, dealId: string, documentId: string, name: string, txn: TxnOption) {
    const document = await this.dealUtils.getDealDocument(user, dealId, documentId, txn, 'WRITE');
    document.name = name;
    await this.documentService.save(document, txn);
  }

  @transactional()
  async updateChargeCodeConfig(
    dealId: string, documentId: string, user: AccountUser, chargeCodeConfig: ChargeCodeConfig, txn: TxnOption,
  ) {
    const document = await this.dealUtils.getDealDocument(user, dealId, documentId, txn, 'WRITE');
    const documentData = await document.documentData;
    documentData.chargeCodeConfig = chargeCodeConfig;
    await this.documentDataService.save(documentData, txn);
  }

  async getChargeCodeConfig(dealId: string, documentId: string, user: AccountUser): Promise<ChargeCodeConfig> {
    const document = await this.dealUtils.getDealDocument(user, dealId, documentId, null, 'READ');
    const documentData = await document.documentData;
    return documentData.chargeCodeConfig;
  }

  @transactional()
  async updateOccupancyConfig(
    dealId: string, documentId: string, user: AccountUser, occupancyConfig: OccupancyConfig, txn: TxnOption,
  ): Promise<void> {
    const document = await this.dealUtils.getDealDocument(user, dealId, documentId, txn, 'WRITE');
    const documentData = await document.documentData;
    documentData.occupancyConfig = occupancyConfig;
    await this.documentDataService.save(documentData, txn);
  }

  async getOccupancyConfig(dealId: string, documentId: string, user: AccountUser): Promise<OccupancyConfig> {
    const document = await this.dealUtils.getDealDocument(user, dealId, documentId, null, 'READ');
    const documentData = await document.documentData;
    return documentData.occupancyConfig;
  }

  @transactional()
  async updateFPConfig(
    dealId: string, documentId: string, user: AccountUser, floorPlanConfig: FPConfig, txn: TxnOption,
  ): Promise<void> {
    const document = await this.dealUtils.getDealDocument(user, dealId, documentId, txn, 'WRITE');
    const documentData = await document.documentData;
    documentData.floorPlanConfig = floorPlanConfig;
    await this.documentDataService.save(documentData, txn);
  }

  async getFPConfig(dealId: string, documentId: string, user: AccountUser): Promise<FPConfig> {
    const document = await this.dealUtils.getDealDocument(user, dealId, documentId, null, 'READ');
    const documentData = await document.documentData;
    return documentData.floorPlanConfig;
  }

  @transactional()
  async updateLastUsedRenovatedConfig(
    dealId: string, documentId: string, user: AccountUser,
    lastUsedRenovatedConfig: RenovationConfiguration,
    txn: TxnOption,
  ): Promise<void> {
    const document = await this.dealUtils.getDealDocument(user, dealId, documentId, txn, 'WRITE');
    const documentData = await document.documentData;
    documentData.lastUsedRenovatedConfig = lastUsedRenovatedConfig;
    await this.documentDataService.save(documentData, txn);
  }

  async getLastUsedRenovatedConfig(
    dealId: string, documentId: string, user: AccountUser,
  ): Promise<RenovationConfiguration> {
    const document = await this.dealUtils.getDealDocument(user, dealId, documentId, null, 'READ');
    const documentData = await document.documentData;
    return documentData.lastUsedRenovatedConfig;
  }

  @transactional()
  async updateLastUsedAffordableConfig(
    dealId: string, documentId: string, user: AccountUser,
    lastUsedAffordableConfig: AffordableConfiguration,
    txn: TxnOption,
  ): Promise<void> {
    const document = await this.dealUtils.getDealDocument(user, dealId, documentId, txn, 'WRITE');
    const documentData = await document.documentData;
    documentData.lastUsedAffordableConfig = lastUsedAffordableConfig;
    await this.documentDataService.save(documentData, txn);
  }

  async getLastUsedAffordableConfig(
    dealId: string, documentId: string, user: AccountUser,
  ): Promise<AffordableConfiguration> {
    const document = await this.dealUtils.getDealDocument(user, dealId, documentId, null, 'READ');
    const documentData = await document.documentData;
    return documentData.lastUsedAffordableConfig;
  }

  @transactional()
  async updateLastUsedMtmConfig(
    dealId: string, documentId: string, user: AccountUser,
    lastUsedMtmConfig: MtmConfiguration,
    txn: TxnOption,
  ): Promise<void> {
    const document = await this.dealUtils.getDealDocument(user, dealId, documentId, txn, 'WRITE');
    const documentData = await document.documentData;
    documentData.lastUsedMtmConfig = lastUsedMtmConfig;
    await this.documentDataService.save(documentData, txn);
  }

  async getLastUsedMtmConfig(
    dealId: string, documentId: string, user: AccountUser,
  ): Promise<MtmConfiguration> {
    const document = await this.dealUtils.getDealDocument(user, dealId, documentId, null, 'READ');
    const documentData = await document.documentData;
    return documentData.lastUsedMtmConfig;
  }

  async validateDocument(
    dealId: string, documentId: string, user: AccountUser, validate: boolean,
    txn: TxnOption,
  ): Promise<Document> {
    const document = await this.dealUtils.getDealDocument(user, dealId, documentId, null, 'WRITE');
    if (validate) {
      document.status = DocumentStatus.Validated;
    } else {
      document.status = DocumentStatus.Processed;
    }
    await this.documentService.save(document, txn);
    return document;
  }

  async raiseDocumentTicket(user: AccountUser, dealId: string, documentId: string, ticketDetails: TicketDetails) {
    const deal = await this.dealUtils.getUserDeal(dealId, user, null);
    const document = await this.dealUtils.getDealDocument(user, dealId, documentId, null, 'WRITE');
    const account = await deal.account;
    await this.auManager.ensureAccountUsersCGData([user]);
    await this.accountManager.ensureCGAccountData(account);
    const { stream } = await this.getDealDocumentFile(user, dealId, documentId, null);
    const supportTicketMailOptions = await this.mailsManager.raiseTicketMailData(
      account, user, deal, document, stream, ticketDetails,
    );
    const supportTicketMailToUserOptions = await this.mailsManager.raiseTicketMailToUserData(
      user, deal, document, ticketDetails,
    );
    await this.mailService.sendMail(supportTicketMailOptions);
    await this.mailService.sendMail(supportTicketMailToUserOptions);
  }

  async setAsOnDate(user: AccountUser, dealId: string, documentId: string, asOnDate: string, txn: TxnOption) {
    const document = await this.dealUtils.getDealDocument(user, dealId, documentId, txn, 'WRITE');
    document.asOnDate = asOnDate;
    await this.documentService.save(document, txn);
  }
}
