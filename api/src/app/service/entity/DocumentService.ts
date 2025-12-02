import { EntityService } from '../../../bootstrap/service/entity/EntityService';
import { Document } from '../../db/entity/Document';
import { DocumentType } from '../../models/enums/DocumentType';
import { TxnOption } from '../../../framework/plugins/TypeORMPlugin/Transaction';
import { injectable } from '../../boot';
import { DocumentStatus } from '../../models/enums/DocumentStatus';
import { Deal } from '../../db/entity/Deal';
import { DocumentData } from '../../db/entity/DocumentData';
import { CFColumn, CFDataColumn, CFStaticColumn } from '../../types';
import { DateTime } from 'luxon';

export type CreateDocumentParams =
  Pick<Document, 'deal' | 'name' | 'storagePath' | 'documentType' | 'startPage' | 'endPage'>

@injectable()
export class DocumentService extends EntityService<Document> {
  constructor() {
    super(Document);
  }

  async createDocument(params: CreateDocumentParams, txn: TxnOption) {
    const document = new Document();
    document.deal = params.deal;

    document.name = params.name;
    document.storagePath = params.storagePath;
    document.documentType = params.documentType;

    document.startPage = params.startPage;
    document.endPage = params.endPage;

    document.status = DocumentStatus.New;

    return this.save(document, txn);
  }

  async getDealDocuments(deal: Deal, txn: TxnOption): Promise<Document[]> {
    return this.getRepository(txn).createQueryBuilder('d')
      .where({ deal })
      .orderBy('d.createdAt', 'DESC')
      .getMany();
  }

  async getDealDocument(deal: Deal, documentId: string, txn: TxnOption): Promise<Document> {
    return this.getRepository(txn).createQueryBuilder('d')
      .where({ deal })
      .andWhere({ id: documentId })
      .getOne();
  }

  async getDealDocumentsByIds(deal: Deal, documentIds: string[], txn: TxnOption): Promise<Document[]> {
    return this.getRepository(txn).createQueryBuilder('d')
      .where({ deal })
      .andWhere('id IN(:...ids)', { ids: documentIds })
      .orderBy('d.createdAt', 'DESC')
      .getMany();
  }

  updateDocumentPeriod(document: Document, documentData: DocumentData) {
    if (document.documentType === DocumentType.CF) {
      let periodFrom: DateTime = null;
      let periodTo: DateTime = null;

      for (const column of documentData.editedData.columns) {
        const cfColumn = column as CFColumn;
        if (!(cfColumn as CFStaticColumn).isStatic) {
          const dataColumn = cfColumn as CFDataColumn;
          if (!dataColumn.discard) {
            if (dataColumn.periodEndDate) {
              const _periodTo: DateTime = DateTime.fromISO(dataColumn.periodEndDate);
              let _periodFrom: DateTime;
              if (dataColumn.period === 'ytd' || dataColumn.period === 'yearly') {
                _periodFrom = _periodTo.startOf('year');
              } else if (dataColumn.period === 'monthly') {
                _periodFrom = _periodTo.startOf('month');
              } else if (dataColumn.period === 'ttm') {
                _periodFrom = _periodTo.minus({ year: 1 }).plus({ day: 1 });
              } else if (dataColumn.period === 'quarterly') {
                _periodFrom = _periodTo.startOf('quarter');
              } else {
                // _periodFrom remains null
                // shouldn't happen though
              }

              if (_periodFrom) {
                if (periodFrom === null || Number(_periodFrom) < Number(periodFrom)) {
                  periodFrom = _periodFrom;
                }
              }

              if (periodTo === null || Number(_periodTo) > Number(periodTo)) {
                periodTo = _periodTo;
              }
            }
          }
        }
      }

      document.periodFrom = periodFrom ? periodFrom.toISODate() : document.periodFrom;
      document.periodTo = periodTo ? periodTo.toISODate() : document.periodTo;
    }
  }
}
