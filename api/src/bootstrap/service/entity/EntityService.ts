import {
  ObjectType,
  getConnection,
  Repository,
  QueryFailedError,
  FindManyOptions,
  FindOneOptions,
  FindConditions,
  DeepPartial,
} from 'typeorm';
import { TxnOption } from '../../../framework/plugins/TypeORMPlugin/Transaction';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { transactional } from '../../../framework/plugins/TypeORMPlugin/decorators/transactional';
import { PaginationOptions } from '../../models/types/PaginationOptions';

export class DuplicateEntryError extends Error {
  constructor(readonly columns, readonly entityName) {
    super();
  }
}

type QFEDuplicateEntry = QueryFailedError & {
  code?: string,
}


abstract class EntityService<Entity> {
  Entity: ObjectType<any>;

  protected constructor(Entity: ObjectType<any>) {
    this.Entity = Entity;
  }

  getRepository(transaction: TxnOption = null, connection: string = undefined): Repository<Entity> {
    if (transaction && transaction.transactionalManager) {
      return transaction.transactionalManager.getRepository(this.Entity);
    }

    return getConnection(connection).getRepository(this.Entity);
  }

  @transactional()
  async save(obj: DeepPartial<Entity>, txnOptions: TxnOption): Promise<Entity> {
    try {
      return await this.getRepository(txnOptions).save(obj);
    } catch (e) {
      if (e instanceof QueryFailedError) {
        this.handleQueryFailedError(e);
      } else {
        throw e;
      }
    }
  }

  @transactional()
  async delete(obj: Entity, txnOptions: TxnOption): Promise<Entity> {
    return this.getRepository(txnOptions).remove(obj);
  }

  @transactional()
  async deleteById(id: string, txnOption: TxnOption): Promise<any> {
    return this.getRepository(txnOption).delete(id);
  }

  @transactional()
  async findById(id: any, txnOption: TxnOption): Promise<Entity> {
    return this.getRepository(txnOption).findOneOrFail(id);
  }

  @transactional()
  async find(options: FindManyOptions<Entity>, txn: TxnOption): Promise<Entity[]> {
    return this.getRepository(txn).find(options);
  }

  @transactional()
  async findOne(options: FindOneOptions<Entity>, txn: TxnOption): Promise<Entity> {
    return this.getRepository(txn).findOne(options);
  }

  @transactional()
  async count(options: FindOneOptions<Entity>, txn: TxnOption): Promise<number> {
    return this.getRepository(txn).count(options);
  }

  @transactional()
  async updateById(id: string, partialEntity: QueryDeepPartialEntity<Entity>, transaction: TxnOption): Promise<any> {
    try {
      await this.getRepository(transaction).update(id, partialEntity);
    } catch (e) {
      if (e instanceof QueryFailedError) {
        this.handleQueryFailedError(e);
      } else {
        throw e;
      }
    }
  }

  @transactional()
  async update(
    condition: FindConditions<Entity>,
    partialEntity: QueryDeepPartialEntity<Entity>,
    transaction: TxnOption,
  ): Promise<any> {
    try {
      await this.getRepository(transaction).update(condition, partialEntity);
    } catch (e) {
      if (e instanceof QueryFailedError) {
        this.handleQueryFailedError(e);
      } else {
        throw e;
      }
    }
  }

  @transactional()
  async list(pageOptions: PaginationOptions, txtOption: TxnOption): Promise<Entity[]> {
    return this.getRepository(txtOption).find({
      take: pageOptions.pageSize,
      skip: ((pageOptions.page - 1) * pageOptions.pageSize),
    });
  }

  private handleQueryFailedError(error: QueryFailedError) {
    if (error['code'] === 'ER_DUP_ENTRY') {
      error = <QFEDuplicateEntry>error;
      const repo = this.getRepository();
      const indexName = error.message.split('\'')[3].split('.')[1];
      const indexMetadata = repo.metadata.indices.find((imd) => imd.name === indexName);
      const target = typeof repo.target === 'function' ? repo.target.name : repo.target;
      throw new DuplicateEntryError(indexMetadata.givenColumnNames, target);
    } else {
      throw error;
    }
  }
}

export { EntityService };
