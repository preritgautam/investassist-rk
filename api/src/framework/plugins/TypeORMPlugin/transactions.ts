import { Transaction } from './Transaction';
import { EntityManager, getConnection } from 'typeorm';

export type TransactionalFunction = (TxnOptions) => Promise<any>;


export function transaction(fn: TransactionalFunction, transactionOptions: Transaction, connection = undefined) {
  if (transactionOptions && transactionOptions.transactionalManager) {
    return fn(transactionOptions);
  } else {
    return getConnection(connection).transaction(async (transactionalManager: EntityManager) => {
      return fn({ transactionalManager });
    });
  }
}
