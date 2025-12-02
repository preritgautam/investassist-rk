import { EntityTarget } from 'typeorm/common/EntityTarget';
import { TxnOption } from '../../../framework/plugins/TypeORMPlugin/Transaction';
import { getConnection, Repository } from 'typeorm';

export class EntityRepository {
  static getRepository<E>(
    entity: EntityTarget<E>, transaction: TxnOption = null, connection: string = undefined,
  ): Repository<E> {
    if (transaction && transaction.transactionalManager) {
      return transaction.transactionalManager.getRepository(entity);
    }
    return getConnection(connection).getRepository(entity);
  }
}
