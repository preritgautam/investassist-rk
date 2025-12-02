import { EntityService } from '../../../bootstrap/service/entity/EntityService';
import { injectable } from '../../boot';
import { DocumentData } from '../../db/entity/DocumentData';

@injectable()
export class DocumentDataService extends EntityService<DocumentData> {
  constructor() {
    super(DocumentData);
  }
}
