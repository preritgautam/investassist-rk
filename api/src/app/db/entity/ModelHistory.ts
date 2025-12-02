import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { expose, serializable } from '../../../framework/plugins/SerializerPlugin';
import { Deal } from './Deal';
import { DocumentType } from '../../models/enums/DocumentType';


export interface ModelDocument {
  documentId: string;
  documentName: string;
  documentType: DocumentType;
  asOnDate?: string;
  periodStart?: string;
  periodEnd?: string;
}


@serializable()
@Entity()
export class ModelHistory {
  @expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @expose()
  @Column()
  name: string;

  @ManyToOne(() => Deal, (deal) => deal.modelHistories, { onDelete: 'CASCADE' })
  @JoinColumn()
  deal: Promise<Deal>;

  @expose()
  @Column({ type: 'json' })
  documents: ModelDocument[];

  @Column({ type: 'json' })
  modelData: object;

  @expose()
  @CreateDateColumn()
  createdAt: Date;
}
