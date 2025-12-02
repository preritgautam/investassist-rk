import { EntityManager } from 'typeorm';

export interface Transaction {
  transactionalManager: EntityManager
}

export type TxnOption = Transaction | null;
