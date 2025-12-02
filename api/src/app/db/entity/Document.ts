import { Column, CreateDateColumn, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { expose, serializable } from '../../../framework/plugins/SerializerPlugin';
import { Deal } from './Deal';
import { DocumentStatus } from '../../models/enums/DocumentStatus';
import { DocumentType } from '../../models/enums/DocumentType';
import { DocumentData } from './DocumentData';

@serializable()
@Entity()
export class Document {
  @expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Deal, (deal) => deal.documents, { onDelete: 'RESTRICT' })
  deal: Promise<Deal>;

  @OneToOne(() => DocumentData, (documentData) => documentData.document)
  documentData: Promise<DocumentData>;

  @expose()
  @Column()
  name: string;

  @Column()
  storagePath: string;

  @expose()
  @Column({ type: 'varchar', length: 32, transformer: DocumentType.getTransformer() })
  documentType: DocumentType;

  @expose()
  @Column()
  startPage: number;

  @expose()
  @Column()
  endPage: number;

  @expose()
  @Column({ type: 'varchar', length: 32, transformer: DocumentStatus.getTransformer() })
  status: DocumentStatus;

  @expose()
  @Column({ nullable: true })
  periodFrom?: string;

  @expose()
  @Column({ nullable: true })
  periodTo?: string;

  @expose()
  @Column({ nullable: true })
  asOnDate?: string;

  @expose()
  @CreateDateColumn()
  createdAt: Date;
}
