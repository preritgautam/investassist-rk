import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { expose, serializable } from '../../../framework/plugins/SerializerPlugin';
import { Amount, AreaSqFt, ISODate, ISOMonth, Percent } from '../../types';
import { Deal } from './Deal';

@serializable()
@Entity()
export class DealDetails {
  @expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Deal, (deal) => deal.details, { onDelete: 'CASCADE' })
  @JoinColumn()
  deal: Promise<Deal>;


  // Deal Details Start
  // -----------------------------------
  @expose()
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  purchasePrice: Amount;

  @expose()
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  fund: Amount;

  @expose()
  @Column({ type: 'varchar', length: 10, nullable: true })
  bidDueDate: ISODate;

  @expose()
  @Column({ type: 'varchar', length: 10, nullable: true })
  startOfOperations: ISODate;
  // -----------------------------------
  // Deal Details End

  // Property Details Start
  // -----------------------------------
  @expose()
  @Column()
  numUnits: number;

  @expose()
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalArea?: AreaSqFt;

  @expose()
  @Column({ nullable: true })
  buildingType: string;

  @expose()
  @Column({ nullable: true })
  ageRestricted: string;

  @expose()
  @Column({ nullable: true })
  affordabilityStatus: string;

  @expose()
  @Column({ type: 'varchar', length: 10 })
  dateBuilt: ISOMonth;

  @expose()
  @Column({ type: 'varchar', length: 10, nullable: true })
  dateRenovated?: ISOMonth;

  @expose()
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  affordableUnitsPercent: Percent;

  @expose()
  @Column({ nullable: true })
  noOfBuildings: number;

  @expose()
  @Column({ nullable: true })
  noOfStories: number;

  @expose()
  @Column({ type: 'varchar', length: 1, nullable: true })
  assetQuality: 'A' | 'B' | 'C' | 'D';

  @expose()
  @Column({ nullable: true })
  propertyManager: string;

  @expose()
  @Column({ nullable: true })
  sizeAcres: number;

  @expose()
  @Column({ nullable: true })
  parkingSpaces: number;
  // -----------------------------------
  // Property Details End

  // Property Amenities Start
  // -----------------------------------
  @expose()
  @Column({ nullable: true })
  hasElevator: boolean;

  @expose()
  @Column({ nullable: true })
  hasFitnessCenter: boolean;

  @expose()
  @Column({ nullable: true })
  hasDoorman: boolean;

  @expose()
  @Column({ nullable: true })
  hasPool: boolean;

  @expose()
  @Column({ nullable: true })
  hasWaterFront: boolean;

  @expose()
  @Column({ nullable: true })
  hasSpa: boolean;

  @expose()
  @Column({ nullable: true })
  hasRoofDeck: boolean;

  @expose()
  @Column({ nullable: true })
  hasOtherAmenities: boolean;
  // -----------------------------------
  // Property Amenities End

  // Valuation Details Start
  // -----------------------------------
  @expose()
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  expectedPurchasePrice: Amount;

  @expose()
  @Column({ nullable: true })
  equityMultiple: number;

  @expose()
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  requiredEquity: Amount;

  @expose()
  @Column({ nullable: true })
  leveragedIRR: number;

  @expose()
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  goingInCapRateFwd: Percent;
  // -----------------------------------
  // Valuation Details End

  // Transaction Details Start
  // -----------------------------------
  @expose()
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salePrice: Amount;

  @expose()
  @Column({ type: 'varchar', length: 10, nullable: true })
  saleDate: ISODate;

  @expose()
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  capRateTrailing: Percent;

  @expose()
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  noiTrailing12: Amount;

  @expose()
  @Column({ nullable: true })
  buyer: string;

  @expose()
  @Column({ nullable: true })
  seller: string;

  @expose()
  @Column({ nullable: true })
  broker: string;
  // -----------------------------------
  // Transaction Details End

  // Previous Sale Details Start
  // -----------------------------------
  @expose()
  @Column({ type: 'varchar', length: 10, nullable: true })
  lastSaleDate: ISODate;

  @expose()
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lastSalePrice: Amount;
  // -----------------------------------
  // Previous Sale Details End

  @expose()
  @UpdateDateColumn()
  updatedAt: Date;
}
