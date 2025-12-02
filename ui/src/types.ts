import { UserObject } from './bootstrap/session/AuthManager';
import { UseQueryOptions } from 'react-query';
import { RegisterOptions } from 'react-hook-form/dist/types/validator';
import * as XlsxPopulate from 'xlsx-populate';
import { RRUnitInformationField } from './app/enums/RentRollFieldEnum';
import { RentSummary, UnitSummary } from './app/services/document/RentRollDataService';
import { BuildingTypes } from './app/constant/BuildingType';

export type MakeOptional<Type, Key extends keyof Type> = Omit<Type, Key> & Partial<Pick<Type, Key>>;
export type PickOptional<Type, Key extends keyof Type> = MakeOptional<Pick<Type, Key>, Key>;

export interface User extends UserObject {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

export type DealsView = 'table' | 'grid';

export interface UserPreferences {
  dealsView: DealsView;
}

export type AccountStatusType = 'Free' | 'Trial' | 'Paid';

export interface Account {
  id: string;
  name: string;
  isCGEnabled: boolean;
  enabled: boolean;
  slug: string;
  clikGatewayId: string;
  createdAt: string;
  status: AccountStatusType;
  isRegisteredWithStripe?: boolean;
  isPaymentConfirmed?: boolean;
  trialStartedOn: string;
  planId?: string;
  markedForCancellationOn?: string;
  lastInvoiceFailed?: boolean;
  lastInvoiceUrl?: string;
  currentSubscriptionStartedOn?: string;

  oneTrialAvailed: boolean;
  currentSubscriptionEndsOn: string;
  userLimit: number;
}

export interface AccountUser extends User {
  isRootUser?: boolean;
  id: string,
  name: string,
  email: string,
  userPreferences?: UserPreferences,
  accountId?: string;
  accountStatus?: AccountStatusType;
  roles: string[];
  accountDetails: {
    id: string;
    status: string;
    lastInvoiceFailed?: boolean;
    lastInvoiceUrl?: string;
    markedForCancellationOn?: string;
    oneTrialAvailed?: boolean;
    userLimit?: number;
    planId?: string;
  };
  acceptedTermsOn: string;
}

export interface SuperAdmin extends User {
}

export type Amount = number;

export type AreaSqFt = number;

export interface DealDetails {
  numUnits: number;
  purchasePrice: Amount;
  dateBuilt: Year;
  dateRenovated?: ISOMonth;
  totalArea: AreaSqFt;


  bidDueDate: ISODate;
  startOfOperations: ISODate;
  assetQuality?: 'A' | 'B' | 'C' | 'D';
  noOfBuildings?: number;
  noOfStories?: number;
  parkingSpaces?: number;
  buildingType?: BuildingType;
  ageRestricted?: string;
  affordabilityStatus?: string;
  sizeAcres?: number;
  affordableUnitsPercent?: Percent;
  propertyManager?: string;
  hasElevator?: boolean;
  hasFitnessCenter?: boolean;
  hasDoorman?: boolean;
  hasPool?: boolean;
  hasWaterFront?: boolean;
  hasSpa?: boolean;
  hasRoofDeck?: boolean;
  hasOtherAmenities?: boolean;
  expectedPurchasePrice: Amount;
  equityMultiple: number;
  requiredEquity: Amount;
  leveragedIRR: number;
  goingInCapRateFwd: number;
  salePrice: Amount;
  saleDate: ISOMonth;
  capRateTrailing: Percent;
  buyer: string;
  seller: string;
  broker: string;
  lastSaleDate: ISODate;
  lastSalePrice: Amount;
}

export type DealStatus = 'New' | 'In Progress' | 'Completed';

export interface Deal {
  id: string;
  accountId?: string;
  name: string;
  slug: string;
  status: DealStatus;
  address: DealAddress;
  details: DealDetails;
  assumptions?: Assumption;
  createdAt: string;
  updatedAt: string;
  assignedToUser?: AccountUser;
  ownedByUser?: AccountUser;
  isSampleDeal?: boolean;
}

export type DealDocumentType = 'CF' | 'RRF';

export type DealDocumentStatus =
  | 'New'
  | 'Processing'
  | 'Processed'
  | 'Failed'
  | 'Validated'

export interface DealDocument {
  id: string,
  name: string,
  documentType: DealDocumentType,
  status: DealDocumentStatus,
  startPage: number,
  endPage: number,
  deal?: Deal,
  createdAt: string;
  periodFrom?: string,
  periodTo?: string,
  asOnDate?: string,
}

export interface CFExtractedData {
  rows: CFDataRow[];
  columns: CFColumn[];
}

export interface RRFExtractedData {
  rows: RRFDataRow[];
  columns: RRFColumn[];
}

export type ExtractedData = CFExtractedData | RRFExtractedData;

export interface ChargeCodeConfig {
  [code: string]: string;
}

export interface OccupancyConfig {
  [code: string]: string;
}

export type TenantType = 'Residential' | 'Commercial' | '';

export interface FloorPlan {
  beds: string;
  baths: string;
  tenantType: TenantType;
  renameFloorPlan?: string;
}

export interface FPConfig {
  [fp: string]: FloorPlan;
}

export interface RRBedsUnitCountSummary {
  [beds: string]: number;

  unknown: number;
}

export interface DocumentData {
  id: string;
  documentId: string;
  sourceData: any[];
  extractedData: ExtractedData;
  editedData: ExtractedData;
  chargeCodeConfig?: ChargeCodeConfig;
}


export type CFColumnType =
  'actual'
  | 'actual-total'
  | 'others';
export type CFColumnPeriod = 'yearly' | 'ytd' | 'monthly' | 'quarterly' | 'ttm';

export interface CFDataColumn {
  key: string,
  type: CFColumnType,
  period: CFColumnPeriod,
  periodEndDate: string,
  label?: string,
  discard: boolean,
}

export interface CFStaticColumn {
  isStatic: true,
  key: string,
  label?: string,
}

export type CFColumn = CFDataColumn | CFStaticColumn;

export interface ChargeCodeData {
  code: string;
  charges: number;
  otherCharges: number;
  sum: number;
}

export type ChargeCodeValue = ChargeCodeData | number;

export type NumericValue = string | number;

export type RRFDataRow =
  Record<string, number | string | ChargeCodeValue | { total?: number, count?: number } | boolean>
  & {
  __isSummary?: boolean,
};

export interface RRFStaticColumn {
  isStatic: true;
  key: string;
  label?: string;
  name: string;
}

export type RRFDataFieldType = 'unitInformation' | 'chargeCode' | 'additionalDetails' | 'fixed' | 'leaseTerms';

export interface RRFDataColumn {
  // col0, col1...
  key: string;
  // standard column name
  name: string;
  // actual header if any
  header: string;
  // source column index if any
  sourceColumnIndex: number;
  // field type
  type: RRFDataFieldType;
  // is column discarded
  discard: boolean;
  // used on UI to keep a copy of name when field type changes to and from charge code
  originalName?: string;
}

export type RRFColumn = RRFStaticColumn | RRFDataColumn;

export interface CFDataRow {
  __isSummary?: boolean;
  id: number;
  lineItem: string;
  head: string;
  category: string;
  extractCat?: string;
}

export interface CFSummaryCalculatedRow extends CFDataRow {
  matched: string[];
}

export interface DealsFilterValues {
  name: string,
  address: string,
  status: string,
  assignedTo: string,
}

export type OnlyUseQueryOptions<Data> = Omit<UseQueryOptions<Data>, 'queryKey' | 'queryFn'>;

export interface DocumentDataEditor {
  getData: () => ExtractedData;
}

export interface CFSummaryAmounts {
  totalIncome: number;
  totalExpense: number;
  totalCapEx: number;
  noi: number;
  ncf: number;
}

export type DealDocumentFileData = { deal: Deal, document: DealDocument };
export type FileData = File | DealDocumentFileData;

export type ReactHookFormRules = Pick<RegisterOptions,
  'required' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'validate'>


export type Percent = number;
export type ISODate = string;
export type ISOMonth = string;
export type Year = string;


export interface FlexibleAmount {
  type: string;
  value?: Amount;
}

interface AcquisitionValuation {
  type: string;
  value: Percent | Amount;
}

interface DispositionValuation {
  type: string;
  value: Amount;
}

export type MTMUnitsStatus = 'Vacant' | 'Occupied';

/* eslint-disable camelcase */
export interface Assumption {
  id?: string;
  // account: Account;
  // user?: AccountUser;
  // deal?: Deal;
  name?: string;
  createdAt?: Date;
  updatedAt?: string;

  // ----------------------------------------
  // Deal Details Starts
  DD_ClosingDate?: ISODate;
  DD_HoldPeriodYears?: number;
  // Deal Details Ends
  // -----------------------------------------

  // -----------------------------------------
  // Acquisition Assumptions Starts
  AA_AcquisitionValuation?: AcquisitionValuation;
  // Acquisition Assumptions Ends
  // -----------------------------------------


  // -----------------------------------------
  // Disposition Assumptions Starts
  DA_DispositionValuation?: DispositionValuation;
  DA_TerminalCapRate?: Percent;
  // Disposition Assumptions Ends
  // -----------------------------------------


  // -----------------------------------------
  // Closing Cost Starts
  CC_TransferTax?: Percent;
  CC_BrokerCommission?: Percent;
  CC_OtherClosingCosts?: Percent;
  // Closing Cost Assumptions Ends
  // -----------------------------------------

  // -----------------------------------------
  // Other Closing Cost Starts
  OCC_PCAReport?: Amount;
  OCC_EnvironmentalReports?: Amount;
  OCC_OtherDueDiligence?: Amount;
  OCC_BackDuePropertyTaxes?: Amount;
  OCC_OutstandingLiens?: Amount;
  OCC_OtherAssumedLiabilities?: Amount;
  OCC_TitleInsuranceBPS?: Percent;
  OCC_LegalFees?: Amount;
  OCC_ALTASurvey?: Amount;
  OCC_DeferredMaintenance?: Amount;
  OCC_FindersFeesBPS?: Percent;
  OCC_PrepaymentPenalty?: Amount;
  OCC_OtherMiscClosingCosts?: Amount;
  // Other Closing Cost Assumptions Ends
  // -----------------------------------------

  upfrontFunding?: boolean;

  // ------------------------------------------------------
  // Increment & Inflation Assumptions (Annual) Starts
  //  --------------------------
  //  Rent Increments Starts
  IIA_RI_RentIncrement?: Percent;
  IIA_RI_MarketRentUnits?: Percent;
  IIA_RI_RentControlledUnits?: Percent;
  IIA_RI_AffordableUnits?: Percent;
  IIA_RI_Section8Units?: Percent;
  IIA_RI_OtherUnits?: Percent;
  //  Rent Increments Ends
  //  --------------------------
  IIA_OtherIncomeInflation?: Percent;
  // Increment & Inflation Assumptions (Annual) Ends
  // ------------------------------------------------------

  // ------------------------------------------------------
  // Renovation Schedule Starts
  RS_Renovated?: boolean;
  // Renovation Schedule Ends
  // ------------------------------------------------------

  // ------------------------------------------------------
  // Expense Assumptions Starts
  EA_RealEstateTaxes?: FlexibleAmount;
  EA_ManagementFees?: FlexibleAmount;
  // Expense Assumptions Ends
  // ------------------------------------------------------

  // Expense Inflation Starts
  // ------------------------------------------------------
  EI_GeneralInflation?: Percent;
  EI_RealEstateTaxInflation?: Percent;
  // ------------------------------------------------------
  // Expense Inflation Starts

  // Replacement Reserves Starts
  // ------------------------------------------------------
  RR_ProjectedReserves?: FlexibleAmount;
  RR_GrowAtInflation?: boolean;
  // ------------------------------------------------------
  // Replacement Reserves Ends

  // MTM Units Starts
  MTMUnitsStatus: MTMUnitsStatus;
  // MTM Units Ends
}

export type UnitSelectionBasis = 'charge-code' | 'floor-plan';
export type MtmUnitSelectionBasis = 'charge-code' | 'as-on-date';

/* eslint-enable camelcase */
export interface RenovationConfiguration {
  hasRenovation: boolean;
  renovationBasis: UnitSelectionBasis;
  renovationConfig: Record<string, boolean>,
}

export interface AffordableConfiguration {
  hasAffordable: boolean;
  affordableBasis: UnitSelectionBasis;
  affordableConfig: Record<string, string>,
}

export interface MtmConfiguration {
  hasMtm: boolean;
  mtmBasis: MtmUnitSelectionBasis;
  mtmConfig: Record<string, boolean>,
}


export interface RentRollExtraData {
  floorPlanConfig?: FPConfig,
  chargeCodeConfig?: ChargeCodeConfig,
}

export type OccupancySummary = {
  totalUnits: number;
  summary: Record<string, {
    count: number;
  }>
};
export type ChargeCodeSummary = Record<string, number>;
export type FloorPlanSummary = {
  floorPlanColumn: RRUnitInformationField,
  summary: Record<string, {
    unitCount: number;
    unitsOccupied: number;
    averageSqFt: number;
  }>
}

export interface FloorPlanSqFtSummary {
  [floorPlan: string]: {
    totalSqFt: number,
    unitsCount: number,
    avgSqFt: number,
  };
}

export interface RenovatedChartSummary {
  'Renovated': number,
  'Non-Renovated': number,
  'unknown': number,
}

export interface NewLeasesChartSummary {
  [IsoMonth: string]: number;

  unknown: number;
}

export interface OccupancyChartSummary {
  [occupancy: string]: number;

  unknown: number;
}

export interface AffordableChartSummary {
  'Market': number;
  'Affordable': number;
  'Section 8': number;
  'Rent Controlled': number;
  'Other': number;
}

export interface ChargeCodeChartSummary {
  [chargeCode: string]: number;

  unknown: number;
}

export interface DealMatch {
  dealId: string;
  dealName: string;
  matchPercent: number;
  matchCount: number;
}

export interface ModelDocument {
  documentId: string;
  documentName: string;
  documentType: DealDocumentType;
  asOnDate?: string;
  periodStart?: string;
  periodEnd?: string;
}

export interface DealModelHistory {
  id: string;
  name: string;
  documents: ModelDocument[];
  createdAt: string;
}

export type LineItemsDictionary = Record<string, { head: string, category: string }>;

export type CFSummaryType = 'NOI' | 'NCF';
export type RRDiscrepancyType =
  | 'MonthlyRentZero'
  | 'MonthlyRentNonZero'
  | 'MonthlyMarketRentRatio'
  | 'LeaseExpiryBeforeAsOnDate';

export interface RRDiscrepancy {
  message: string,
  type: RRDiscrepancyType,
  row?: number,
  column?: string,
  monthlyRent?: number,
  marketRent?: number,
}

export interface RRDiscrepancies {
  [unitNo: string]: RRDiscrepancy[];
}

export type CFDiscrepancyType =
  | 'NOINCFRowNotFound'
  | 'MultipleNOINCFRows'
  | 'MonthlyNumberDeviation'

export interface CFDiscrepancy {
  lineItem: string,
  message: string,
  type: CFDiscrepancyType,
  row?: number,
  column?: string,
  avgMonthlyAmount?: number,
  deviationMonths?: string[],
}

export interface CFDiscrepancies {
  // eslint-disable-next-line camelcase
  [id__lineItem: string]: CFDiscrepancy[];
}


export interface RRSummaryData {
  fpRentSummary: RentSummary[];
  fpUnitSummary: UnitSummary[];
  fpRentSummarySummary: Partial<RentSummary>;
  fpUnitSummarySummary: Partial<UnitSummary>;
  bedsRentSummary: RentSummary[];
  bedsUnitSummary: UnitSummary[];
  bedsRentSummarySummary: Partial<RentSummary>;
  bedsUnitSummarySummary: Partial<UnitSummary>;
  sqFtRentSummary: RentSummary[];
  sqFtUnitSummary: UnitSummary[];
  fpNameRentSummarySummary: Partial<RentSummary>;
  fpNameUnitSummarySummary: Partial<UnitSummary>;
  fpNameRentSummary: RentSummary[];
  fpNameUnitSummary: UnitSummary[];
  sqFtRentSummarySummary: Partial<RentSummary>;
  sqFtUnitSummarySummary: Partial<UnitSummary>;
}

export interface XlsxPopulateSheet {
  cell: (arg0: string) => { (): any; new(): any; value: { (arg0: any): void; new(): any; }; };
  name: () => any;

  freezePanes(cell: string): void;

  autoFilter(range: XlsxPopulate.range): void;
}

export interface DealAddress {
  line1: string;
  line2: string;
  city: string;
  state: string;
  zipCode: string;
}


export interface SubscriptionSuccessStatus {
  subscriptionSuccessful: boolean;
  plan: 'plan1' | 'plan2';
  isTrial: boolean;
  isPaid: boolean;
  trialStartedOn: string;
}

export type BuildingType = keyof typeof BuildingTypes;

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

export interface AccountTemplate {
  name: string;
  chartOfAccount: Template;
  s3FilePath: string;
  originalFileName: string;
}
