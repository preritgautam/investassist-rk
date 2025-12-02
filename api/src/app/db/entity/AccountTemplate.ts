import { expose, serializable } from '../../../framework/plugins/SerializerPlugin';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Account } from './Account';

export interface COA {
  head: string;
  category: string;
  subCategory?: string;
}

export interface HeaderRowItem {
  type: 'headerRow';
  label: string;
  category: string;
}

export interface RowGroupItem {
  type: 'rowGroup';
  label: string | null;
  categories: string[];
}

export interface TotalRowItem {
  type: 'totalRow';
  label: string;
  categories: string[];
  rowSigns: number[];
}

export type SummaryItem = HeaderRowItem | RowGroupItem | TotalRowItem;

export interface Template {
  items: COA[];
  summary: SummaryItem[];
}

@serializable()
@Entity()
export class AccountTemplate {
  @expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @expose()
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ManyToOne(() => Account, (account: Account) => account.templates, { onDelete: 'RESTRICT' })
  account: Promise<Account>;

  @expose()
  @Column({ type: 'json', nullable: false })
  chartOfAccount: Template;

  @Column()
  s3FilePath: string;

  @expose()
  @Column({})
  originalFileName: string;
}
