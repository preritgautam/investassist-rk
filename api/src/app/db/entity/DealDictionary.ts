import {
  Column,
  CreateDateColumn,
  Entity, JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Deal } from './Deal';
import { DictionaryData } from '../../types';

@Entity()
export class DealDictionary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Deal, (deal) => deal.dealDictionary, { onDelete: 'CASCADE' })
  @JoinColumn()
  deal: Promise<Deal>;

  @Column({ type: 'json' })
  dictionary: DictionaryData;

  @Column({ type: 'json' })
  lineItems: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
