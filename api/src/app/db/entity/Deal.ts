import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId, Unique, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { expose, serializable } from '../../../framework/plugins/SerializerPlugin';
import { Document } from './Document';
import { DealDetails } from './DealDetails';
import { Address } from '../../types';
import { Account } from './Account';
import { AccountUser } from './AccountUser';
import { DealStatus } from '../../models/enums/DealStatus';
import { Assumption } from './Assumption';
import { DealDictionary } from './DealDictionary';
import { DocumentType } from '../../models/enums/DocumentType';
import { ModelHistory } from './ModelHistory';

@serializable()
@Entity()
@Unique('unique_deal_slug', ['account', 'slug'])
export class Deal {
  @expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @expose()
  @Column()
  name: string;

  @expose()
  @Column({ type: 'json' })
  address: Address;

  @expose()
  @Column()
  slug: string;

  @expose()
  @Column({ type: 'varchar', length: 32, transformer: DealStatus.getTransformer() })
  status: DealStatus;

  @OneToOne(() => Assumption, (a) => a.deal, { onDelete: 'CASCADE', nullable: true })
  assumption?: Promise<Assumption>;

  @expose({ groups: ['withDetails'] })
  @OneToOne(() => DealDetails, (details) => details.deal)
  details: Promise<DealDetails>;

  @OneToOne(() => DealDictionary, (dealDictionary) => dealDictionary.deal)
  dealDictionary: Promise<DealDictionary>;

  @OneToMany(() => Document, (document) => document.deal)
  documents: Promise<Document[]>;

  @ManyToOne(() => Account, (account) => account.deals, { onDelete: 'CASCADE' })
  account: Promise<Account>;

  @expose()
  @RelationId((deal: Deal) => deal.account)
  accountId: string;

  @ManyToOne(() => AccountUser, (user) => user.ownedDeals, { onDelete: 'CASCADE' })
  @expose({ groups: ['withOwner'] })
  ownedByUser: Promise<AccountUser>;

  @RelationId((deal: Deal) => deal.ownedByUser)
  ownedByUserId: string;

  @expose({ groups: ['withAssignee'] })
  @ManyToOne(
    () => AccountUser,
    (user) => user.assignedDeals,
    { onDelete: 'CASCADE' },
  )
  assignedToUser: Promise<AccountUser>;

  @RelationId((deal: Deal) => deal.assignedToUser)
  assignedToUserId: string;

  @OneToMany(() => ModelHistory, (modelHistory) => modelHistory.deal)
  modelHistories: Promise<ModelHistory[]>;

  @expose()
  @CreateDateColumn()
  createdAt: Date;

  @expose()
  @UpdateDateColumn()
  updatedAt: Date;

  get rentRolls(): Promise<Document[]> {
    return this.documents.then((documents) => documents.filter((d) => d.documentType === DocumentType.RRF));
  }

  get cashFlows(): Promise<Document[]> {
    return this.documents.then((documents) => documents.filter((d) => d.documentType === DocumentType.CF));
  }

  @expose()
  @Column({ default: false })
  isSampleDeal: boolean;
}
