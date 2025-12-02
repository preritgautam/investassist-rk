import { strFromU8, decompressSync } from 'fflate';
import {
  body,
  controller,
  delete_,
  get,
  params, patch,
  post,
  request,
  response,
} from '../../../../../framework/plugins/WebPlugin';
import { DealController } from './DealController';
import { AccountUser } from '../../../../db/entity/AccountUser';
import { Response } from 'express';
import { DocumentType } from '../../../../models/enums/DocumentType';
import { inject } from '../../../../boot';
import { DealManager } from '../../../../service/manager/DealManager';
import { SerializerService } from '../../../../../framework/plugins/SerializerPlugin';
import { DocumentData } from '../../../../db/entity/DocumentData';
import {
  ChargeCodeConfig,
  ExtractedData,
  OccupancyConfig,
  FPConfig,
  RenovationConfiguration,
  AffordableConfiguration, TicketDetails, MtmConfiguration,
} from '../../../../types';
import { DealUtils } from '../../../../service/manager/DealUtils';
import { DocumentManager } from '../../../../service/manager/DocumentManager';
import { DocumentExtractionManager } from '../../../../service/manager/DocumentExtractionManager';
import { JobsService } from '../../../../../framework/plugins/JobPlugin/JobsService';

@controller({
  parent: DealController,
  route: '/:dealId/documents',
})
export class DealDocumentController {
  constructor(
    @inject(DealManager) private readonly dealManager: DealManager,
    @inject(DocumentManager) private readonly documentManager: DocumentManager,
    @inject(DealUtils) private readonly dealUtils: DealUtils,
    @inject(SerializerService) private readonly serializer: SerializerService,
    @inject(DocumentExtractionManager) private readonly extractionManager: DocumentExtractionManager,
    @inject(JobsService) private readonly jobs: JobsService,
  ) {
  }

  @post('/')
  async uploadDocument(
    @params('dealId') dealId: string,
    @body('fileDataUrl') fileDataUrl: string,
    @body('fileName') fileName: string,
    @body('documentType') documentTypeStr: string,
    @body('startPage') startPage: number,
    @body('endPage') endPage: number,
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const document = await this.documentManager.uploadDealDocument({
      fileName,
      dealId,
      user,
      fileDataUrl,
      documentType: DocumentType.get(documentTypeStr),
      endPage,
      startPage,
    });
    await this.extractionManager.scheduleDocumentExtractionJob(document);

    // schedule a job to send mail that a document is uploaded
    this.jobs.dispatch('mail.document.uploaded', {
      dealId,
      documentId: document.id,
      userId: user.id,
      accountId: user.accountId,
    }).catch(console.error);

    res.status(201).send({
      document: await this.serializer.serialize(document),
    });
  }

  @get('/')
  async getDealDocuments(
    @params('dealId') dealId: string,
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const documents = await this.dealUtils.getDealDocuments(user, dealId, null);
    res.send({
      documents: await this.serializer.serialize(documents),
    });
  }

  @get('/:documentId')
  async getDealDocument(
    @params('dealId') dealId: string,
    @params('documentId') documentId: string,
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const document = await this.dealUtils.getDealDocument(user, dealId, documentId, null, 'READ');
    res.send({
      document: await this.serializer.serialize(document),
    });
  }

  @delete_('/:documentId')
  async deleteDocument(
    @params('dealId') dealId: string,
    @params('documentId') documentId: string,
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    await this.documentManager.deleteDealDocument(user, dealId, documentId, false, null);
    res.send();
  }

  @patch('/:documentId/rename')
  async renameDealDocument(
    @params('dealId') dealId: string,
    @params('documentId') documentId: string,
    @request('user') user: AccountUser,
    @body('name') name: string,
    @response() res: Response,
  ) {
    await this.documentManager.renameDealDocument(user, dealId, documentId, name, null);
    res.send();
  }

  @get('/:documentId/fileUrl')
  async getDocumentFileUrl(
    @params('dealId') dealId: string,
    @params('documentId') documentId: string,
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const url = await this.documentManager.getDealDocumentUrl(user, dealId, documentId, null);
    res.send({
      url,
    });
  }

  @get('/:documentId/file')
  async getDocumentFile(
    @params('dealId') dealId: string,
    @params('documentId') documentId: string,
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const { stream, fileName } = await this.documentManager.getDealDocumentFile(user, dealId, documentId, null);
    res.setHeader('content-type', fileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : '');
    res.setHeader('Content-Disposition', `"attachment;filename=${fileName}"`);
    stream.pipe(res);
  }

  @post('/:documentId/reprocess')
  async reprocessDocument(
    @params('dealId') dealId: string,
    @params('documentId') documentId: string,
    @body('documentType') documentTypeStr: string,
    @body('startPage') startPage: number,
    @body('endPage') endPage: number,
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    await this.documentManager.reprocessDocument({
      user,
      dealId,
      documentId,
      startPage,
      endPage,
    }, null);

    res.send({});
  }

  @get('/:documentId/documentData')
  async getDocumentData(
    @params('dealId') dealId: string,
    @params('documentId') documentId: string,
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const documentData: DocumentData = await this.documentManager.getDocumentData(user, dealId, documentId, null);
    res.send({
      dealId,
      documentId,
      documentData: await this.serializer.serialize(documentData),
    });
  }

  @patch('/:documentId/documentData')
  async updateDocumentData(
    @params('dealId') dealId: string,
    @params('documentId') documentId: string,
    @request('user') user: AccountUser,
    @body('editedData') editedData: object,
    @response() res: Response,
  ) {
    await this.documentManager.updateDocumentData(user, dealId, documentId, editedData as ExtractedData, null);
    res.send();
  }

  @patch('/:documentId/documentData/compressed')
  async updateCompressedDocumentData(
    @params('dealId') dealId: string,
    @params('documentId') documentId: string,
    @request('user') user: AccountUser,
    @body('compressedPayload') compressedPayload: object,
    @response() res: Response,
  ) {
    const data = Object.values(compressedPayload);
    const decompressedBody = decompressSync(new Uint8Array(data));
    const editedData = JSON.parse(strFromU8(decompressedBody));
    await this.documentManager.updateDocumentData(user, dealId, documentId, editedData as ExtractedData, null);
    res.send();
  }

  @get('/:documentId/documentData/chargeCodeConfig')
  async getDocumentDataChargeCodeConfig(
    @params('dealId') dealId: string,
    @params('documentId') documentId: string,
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const chargeCodeConfig = await this.documentManager.getChargeCodeConfig(dealId, documentId, user);
    res.send({ chargeCodeConfig });
  }

  @patch('/:documentId/documentData/chargeCodeConfig')
  async updateDocumentDataChargeCodeConfig(
    @params('dealId') dealId: string,
    @params('documentId') documentId: string,
    @request('user') user: AccountUser,
    @body('chargeCodeConfig') chargeCodeConfig: ChargeCodeConfig,
    @response() res: Response,
  ) {
    await this.documentManager.updateChargeCodeConfig(dealId, documentId, user, chargeCodeConfig, null);
    res.send();
  }


  @get('/:documentId/documentData/occupancyConfig')
  async getDocumentDataOccupancyConfig(
    @params('dealId') dealId: string,
    @params('documentId') documentId: string,
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const occupancyConfig = await this.documentManager.getOccupancyConfig(dealId, documentId, user);
    res.send({ occupancyConfig });
  }

  @patch('/:documentId/documentData/occupancyConfig')
  async updateDocumentDataOccupancyConfig(
    @params('dealId') dealId: string,
    @params('documentId') documentId: string,
    @request('user') user: AccountUser,
    @body('occupancyConfig') occupancyConfig: OccupancyConfig,
    @response() res: Response,
  ) {
    await this.documentManager.updateOccupancyConfig(dealId, documentId, user, occupancyConfig, null);
    res.send();
  }

  @get('/:documentId/documentData/fpConfig')
  async getDocumentDataFPConfig(
    @params('dealId') dealId: string,
    @params('documentId') documentId: string,
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const fpConfig = await this.documentManager.getFPConfig(dealId, documentId, user);
    res.send({ fpConfig });
  }

  @patch('/:documentId/documentData/fpConfig')
  async updateDocumentDataFPConfig(
    @params('dealId') dealId: string,
    @params('documentId') documentId: string,
    @request('user') user: AccountUser,
    @body('fpConfig') fpConfig: FPConfig,
    @response() res: Response,
  ) {
    await this.documentManager.updateFPConfig(dealId, documentId, user, fpConfig, null);
    res.send();
  }

  @get('/:documentId/documentData/lastUsedRenovatedConfig')
  async getDocumentDataRenovatedConfig(
    @params('dealId') dealId: string,
    @params('documentId') documentId: string,
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const lastUsedRenovatedConfig = await this.documentManager.getLastUsedRenovatedConfig(dealId, documentId, user);
    res.send({ lastUsedRenovatedConfig });
  }

  @patch('/:documentId/documentData/lastUsedRenovatedConfig')
  async updateDocumentDataRenovatedConfig(
    @params('dealId') dealId: string,
    @params('documentId') documentId: string,
    @request('user') user: AccountUser,
    @body('lastUsedRenovatedConfig') lastUsedRenovatedConfig: RenovationConfiguration,
    @response() res: Response,
  ) {
    await this.documentManager.updateLastUsedRenovatedConfig(dealId, documentId, user, lastUsedRenovatedConfig, null);
    res.send();
  }


  @get('/:documentId/documentData/lastUsedAffordableConfig')
  async getDocumentDataAffordableConfig(
    @params('dealId') dealId: string,
    @params('documentId') documentId: string,
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const lastUsedAffordableConfig = await this.documentManager.getLastUsedAffordableConfig(dealId, documentId, user);
    res.send({ lastUsedAffordableConfig });
  }

  @patch('/:documentId/documentData/lastUsedAffordableConfig')
  async updateDocumentDataAffordableConfig(
    @params('dealId') dealId: string,
    @params('documentId') documentId: string,
    @request('user') user: AccountUser,
    @body('lastUsedAffordableConfig') lastUsedAffordableConfig: AffordableConfiguration,
    @response() res: Response,
  ) {
    await this.documentManager.updateLastUsedAffordableConfig(dealId, documentId, user, lastUsedAffordableConfig, null);
    res.send();
  }

  @get('/:documentId/documentData/lastUsedMtmConfig')
  async getDocumentDataMtmConfig(
    @params('dealId') dealId: string,
    @params('documentId') documentId: string,
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const lastUsedMtmConfig = await this.documentManager.getLastUsedMtmConfig(dealId, documentId, user);
    res.send({ lastUsedMtmConfig });
  }

  @patch('/:documentId/documentData/lastUsedMtmConfig')
  async updateDocumentDataMtmConfig(
    @params('dealId') dealId: string,
    @params('documentId') documentId: string,
    @request('user') user: AccountUser,
    @body('lastUsedMtmConfig') lastUsedMtmConfig: MtmConfiguration,
    @response() res: Response,
  ) {
    await this.documentManager.updateLastUsedMtmConfig(dealId, documentId, user, lastUsedMtmConfig, null);
    res.send();
  }

  @patch('/:documentId/validate')
  async markDocumentValidated(
    @params('dealId') dealId: string,
    @params('documentId') documentId: string,
    @body('validate') validate: boolean,
    @request('user') user: AccountUser,
    @response() res: Response,
  ) {
    const document = await this.documentManager.validateDocument(dealId, documentId, user, validate, null);
    res.send({
      document: await this.serializer.serialize(document),
    });
  }

  @post('/:documentId/raiseTicket')
  async raiseTicket(
    @params('dealId') dealId: string,
    @params('documentId') documentId: string,
    @request('user') user: AccountUser,
    @body() ticketDetails: TicketDetails,
    @response() res: Response,
  ) {
    await this.documentManager.raiseDocumentTicket(user, dealId, documentId, ticketDetails);
    res.send();
  }

  @patch('/:documentId/asOnDate')
  async setDealDocumentAsOnDate(
    @params('dealId') dealId: string,
    @params('documentId') documentId: string,
    @request('user') user: AccountUser,
    @body('asOnDate') asOnDate: string,
    @response() res: Response,
  ) {
    await this.documentManager.setAsOnDate(user, dealId, documentId, asOnDate, null);
    res.send();
  }
}
