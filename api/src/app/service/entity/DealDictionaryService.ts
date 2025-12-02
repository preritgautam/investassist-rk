import { EntityService } from '../../../bootstrap/service/entity/EntityService';
import { DealDictionary } from '../../db/entity/DealDictionary';
import { injectable } from '../../boot';

@injectable()
export class DealDictionaryService extends EntityService<DealDictionary> {
  constructor() {
    super(DealDictionary);
  }
}
