import { EntityService } from '../../../bootstrap/service/entity/EntityService';
import { injectable } from '../../boot';
import { ModelHistory } from '../../db/entity/ModelHistory';
import { TxnOption } from '../../../framework/plugins/TypeORMPlugin/Transaction';

export type CreateModelHistoryParams =
  Pick<ModelHistory, 'deal' | 'name' | 'documents' | 'modelData'>

@injectable()
export class ModelHistoryService extends EntityService<ModelHistory> {
  constructor() {
    super(ModelHistory);
  }

  async addModelHistory(params: CreateModelHistoryParams, txn: TxnOption) {
    const modelHistory = new ModelHistory();
    modelHistory.name = params.name;
    modelHistory.documents = params.documents;
    modelHistory.modelData = params.modelData;
    modelHistory.deal = params.deal;

    return this.save(modelHistory, txn);
  }
}
