import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { expose, serializable } from '../../../framework/plugins/SerializerPlugin';
import { Document } from './Document';
import {
  ChargeCodeConfig,
  ExtractedData,
  OccupancyConfig,
  FPConfig,
  RenovationConfiguration,
  AffordableConfiguration, MtmConfiguration,
} from '../../types';

@serializable()
@Entity()
export class DocumentData {
  @expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Document, (document) => document.documentData, { onDelete: 'CASCADE' })
  @JoinColumn()
  document: Promise<Document>;

  @Column({ type: 'json' })
  mlResponse: object;

  @expose()
  @Column({ type: 'json' })
  sourceData: object;

  @expose()
  @Column({ type: 'json' })
  extractedData: ExtractedData;

  @expose()
  @Column({ type: 'json' })
  editedData: ExtractedData;

  @expose()
  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'json', nullable: true })
  chargeCodeConfig: ChargeCodeConfig;

  @Column({ type: 'json', nullable: true })
  occupancyConfig: OccupancyConfig;

  @Column({ type: 'json', nullable: true })
  floorPlanConfig: FPConfig;

  @Column({ type: 'json', nullable: true })
  lastUsedRenovatedConfig: RenovationConfiguration;

  @Column({ type: 'json', nullable: true })
  lastUsedAffordableConfig: AffordableConfiguration;

  @Column({ type: 'json', nullable: true })
  lastUsedMtmConfig: MtmConfiguration;
}
