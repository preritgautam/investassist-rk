/* eslint-disable camelcase */
import {
  Column,
  CreateDateColumn,
  Entity, JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { expose, serializable } from '../../../framework/plugins/SerializerPlugin';
import { Account } from './Account';
import { AccountUser } from './AccountUser';
import { Deal } from './Deal';
import { Percent, Amount, ISODate, MTMUnitsStatus } from '../../types';

export interface FlexibleAmount {
  type: 'dollarPerUnit' | 'dollarPerOccupiedUnit' | 'dollarPerSqFt' | 'percentEGI' |
    'total' | 'onHistorical' | 'atClose';
  value: number;
}

interface AcquisitionValuation {
  type: 'TotalPrice' | 'PricePerUnit' | 'ProformaCapRate' | 'HistoricalCapRate' | 'LeveragedIRR';
  value: Percent | Amount;
}

interface DispositionValuation {
  type: 'T12NOI' | 'F12NOI';
  value: Amount;
}

@serializable()
@Entity()
export class Assumption {
  @expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Account, (account) => account.assumptions, { onDelete: 'CASCADE' })
  account: Promise<Account>;

  @ManyToOne(() => AccountUser, (user) => user.assumptions, { nullable: true, onDelete: 'CASCADE' })
  user: Promise<AccountUser>;

  @OneToOne(() => Deal, (deal) => deal.assumption, { onDelete: 'CASCADE' })
  @JoinColumn()
  deal: Promise<Deal>;

  @expose()
  @Column()
  name: string;

  @expose()
  @CreateDateColumn()
  createdAt: Date;

  @expose()
  @UpdateDateColumn()
  updatedAt: Date;

  // ----------------------------------------
  // Deal Details Starts
  @expose({ groups: ['withData'] })
  @Column({ type: 'varchar', length: 10, nullable: true })
  DD_ClosingDate?: ISODate;

  @expose({ groups: ['withData'] })
  @Column({ nullable: true })
  DD_HoldPeriodYears?: number;
  // Deal Details Ends
  // -----------------------------------------

  // -----------------------------------------
  // Acquisition Assumptions Starts
  @expose({ groups: ['withData'] })
  @Column({ type: 'json', nullable: true })
  AA_AcquisitionValuation: AcquisitionValuation;
  // Acquisition Assumptions Ends
  // -----------------------------------------


  // -----------------------------------------
  // Disposition Assumptions Starts
  @expose({ groups: ['withData'] })
  @Column({ type: 'json', nullable: true })
  DA_DispositionValuation: DispositionValuation;

  @expose({ groups: ['withData'] })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  DA_TerminalCapRate: Percent;
  // Disposition Assumptions Ends
  // -----------------------------------------


  // -----------------------------------------
  // Closing Cost Starts
  @expose({ groups: ['withData'] })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  CC_TransferTax: Percent;

  @expose({ groups: ['withData'] })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  CC_BrokerCommission: Percent;

  @expose({ groups: ['withData'] })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  CC_OtherClosingCosts: Percent;
  // Closing Cost Assumptions Ends
  // -----------------------------------------

  // -----------------------------------------
  // Other Closing Cost Starts
  @expose({ groups: ['withData'] })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  OCC_PCAReport: Amount;

  @expose({ groups: ['withData'] })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  OCC_EnvironmentalReports: Amount;

  @expose({ groups: ['withData'] })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  OCC_OtherDueDiligence: Amount;

  @expose({ groups: ['withData'] })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  OCC_BackDuePropertyTaxes: Amount;

  @expose({ groups: ['withData'] })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  OCC_OutstandingLiens: Amount;

  @expose({ groups: ['withData'] })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  OCC_OtherAssumedLiabilities: Amount;

  @expose({ groups: ['withData'] })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  OCC_TitleInsuranceBPS: Percent;

  @expose({ groups: ['withData'] })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  OCC_LegalFees: Amount;

  @expose({ groups: ['withData'] })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  OCC_ALTASurvey: Amount;

  @expose({ groups: ['withData'] })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  OCC_DeferredMaintenance: Amount;

  @expose({ groups: ['withData'] })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  OCC_FindersFeesBPS: Percent;

  @expose({ groups: ['withData'] })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  OCC_PrepaymentPenalty: Amount;

  @expose({ groups: ['withData'] })
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  OCC_OtherMiscClosingCosts: Amount;
  // Other Closing Cost Assumptions Ends
  // -----------------------------------------

  @expose({ groups: ['withData'] })
  @Column()
  upfrontFunding: boolean;

  // ------------------------------------------------------
  // Increment & Inflation Assumptions (Annual) Starts

  //  --------------------------
  //  Rent Increments Starts
  @expose({ groups: ['withData'] })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  IIA_RI_RentIncrement: Percent;

  @expose({ groups: ['withData'] })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  IIA_RI_MarketRentUnits: Percent;

  @expose({ groups: ['withData'] })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  IIA_RI_RentControlledUnits: Percent;

  @expose({ groups: ['withData'] })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  IIA_RI_AffordableUnits: Percent;

  @expose({ groups: ['withData'] })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  IIA_RI_Section8Units: Percent;

  @expose({ groups: ['withData'] })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  IIA_RI_OtherUnits: Percent;
  //  Rent Increments Ends
  //  --------------------------

  @expose({ groups: ['withData'] })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  IIA_OtherIncomeInflation: Percent;
  // Increment & Inflation Assumptions (Annual) Ends
  // ------------------------------------------------------

  // ------------------------------------------------------
  // Renovation Schedule Starts
  @expose({ groups: ['withData'] })
  @Column()
  RS_Renovated: boolean;
  // Renovation Schedule Ends
  // ------------------------------------------------------


  // ------------------------------------------------------
  // Expense Assumptions Starts
  @expose({ groups: ['withData'] })
  @Column({ type: 'json', nullable: true })
  EA_RealEstateTaxes?: FlexibleAmount;

  @expose({ groups: ['withData'] })
  @Column({ type: 'json', nullable: true })
  EA_ManagementFees?: FlexibleAmount;
  // Expense Assumptions Ends
  // ------------------------------------------------------


  // Expense Inflation Starts
  // ------------------------------------------------------
  @expose({ groups: ['withData'] })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  EI_GeneralInflation?: Percent;

  @expose({ groups: ['withData'] })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  EI_RealEstateTaxInflation?: Percent;
  // ------------------------------------------------------
  // Expense Inflation Starts


  // Replacement Reserves Starts
  // ------------------------------------------------------
  @expose({ groups: ['withData'] })
  @Column({ type: 'json', nullable: true })
  RR_ProjectedReserves: FlexibleAmount;

  @expose({ groups: ['withData'] })
  @Column()
  RR_GrowAtInflation: boolean;
  // ------------------------------------------------------
  // Replacement Reserves Ends

  @expose({ groups: ['withData'] })
  @Column({ type: 'varchar', default: 'Occupied' })
  MTMUnitsStatus: MTMUnitsStatus;
}
