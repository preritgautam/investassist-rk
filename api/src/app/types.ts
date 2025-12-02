export type MakeOptional<Type, Key extends keyof Type> = Omit<Type, Key> & Partial<Pick<Type, Key>>;
export type PickOptional<Type, Key extends keyof Type> = MakeOptional<Pick<Type, Key>, Key>;


export interface CGAccount {
  id: string,
  name: string,
  slug: string,
  enabled: boolean,
  createdAt: string,
}

export interface CGAccountUser {
  id: string,
  name: string,
  email: string,
  username: string,
  enabled: boolean,
  isRootUser: boolean,
  roles: ('Admin' | 'User')[],
  lastAcceptedTermsOn?: string,
  uid: string,
  account?: CGAccount,
  createdAt: string,
}


export type AccountStatusType = 'Free' | 'Trial' | 'Paid';

export interface CGSuperAdmin {
  id: string,
  name: string,
  email: string,
}

export type AreaSqFt = number;

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zipCode: string;
}

export type Amount = number;

export type Percent = number;

export interface DictionaryData {
  [lineItem: string]: {
    head: string;
    category: string;
  };
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
  discard?: boolean;
}

export interface CFStaticColumn {
  isStatic: true,
  key: string,
  label?: string,
}

export type CFColumn = CFDataColumn | CFStaticColumn;

export interface CFDataRow {
  id: number;
  pageNumber: number;
  lineItem: string;
  head: string;
  category: string;
  extractCat?: string;
}

export interface CFMLLineItemRow {
  id: number;
  // eslint-disable-next-line camelcase
  line_item: string;
  extractcat: string;
  head: string;
  category: string;
}

export interface CFMLColumn {
  header: string,
  // eslint-disable-next-line camelcase
  is_numeric: boolean,
  // eslint-disable-next-line camelcase
  is_line_item: boolean,
  // eslint-disable-next-line camelcase
  is_line_item_code: boolean,
  type: CFColumnType,
  period: CFColumnPeriod,
  month: number,
  year: number,
  quarter: number
}

export interface CFMLPageResult {
  page: number,
  // eslint-disable-next-line
  line_items: CFMLLineItemRow[],
  columns: CFMLColumn[],
}

export interface CFMLResponse {
  assetType: string,
  documentType: string,
  // eslint-disable-next-line camelcase
  period_from: string,
  // eslint-disable-next-line camelcase
  period_to: string,
  result: CFMLPageResult[]
}

export interface CFExtractedData {
  rows: CFDataRow[];
  columns: CFColumn[];
}

export interface RRFMLColumn {
  name: string;
  header: string;
  // eslint-disable-next-line camelcase
  source_col_index: number;
}

export interface MLChargeCode {
  code: string;
  // eslint-disable-next-line camelcase
  CC_charges: number;
  // eslint-disable-next-line camelcase
  CC_charges_sum: number;
  // eslint-disable-next-line camelcase
  CC_other_charges: number;
  id: number;
}

export type RRFMLRow = Record<string, number | string | MLChargeCode[]>

export interface RRFMLPageResult {
  page: number;
  // eslint-disable-next-line camelcase
  is_scanned: boolean;
  rentroll: RRFMLRow[];
  columns: RRFMLColumn[];
  source: Record<string, string | number>[];
}

export interface MLChargeCodeColumn {
  code: string;
}

export interface RRFMLResponse {
  assetType: string;
  documentType: string;
  // eslint-disable-next-line camelcase
  as_on_date: string;
  result: RRFMLPageResult[];
  // eslint-disable-next-line camelcase
  charge_codes: MLChargeCodeColumn[];
}

export interface ChargeCodeData {
  code: string;
  charges: number;
  otherCharges: number;
  sum: number;
}

export type ChargeCodeValue = ChargeCodeData | number;
export type RRFDataRow = Record<string, number | string | ChargeCodeValue | boolean> & {
  id: number;
};

export interface RRFStaticColumn {
  isStatic: true;
  key: string;
  label?: string;
  name: string;
}

export type RRFDataFieldType = 'unitInformation' | 'chargeCode' | 'additionalDetails' | 'fixed' | 'leaseTerms'

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
  discard?: boolean;
  isStatic?: undefined;
}

export type RRFColumn = RRFStaticColumn | RRFDataColumn;

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

export type ISOMonth = string; // yyyy-mm

export type ISODate = string; // yyyy-mm-dd

export type UnitSelectionBasis = 'charge-code' | 'floor-plan';
export type MtmUnitSelectionBasis = 'charge-code' | 'as-on-date';

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
  mtmConfig: Record<string, string>,
}

export type DealsView = 'table' | 'grid';

export interface UserPreferences {
  dealsView: DealsView;
}

export type IssueType =
  | 'NO_DATA_EXTRACTED'
  | 'PARTIAL_DATA_EXTRACTED'
  | 'EXTRA_DATA_EXTRACTED'
  | 'OTHERS'

export interface TicketDetails {
  issueType: IssueType;
  details?: string;
}

export type MTMUnitsStatus = 'Vacant' | 'Occupied';


export type PlanId = 'plan1' | 'plan2';

export interface SubscriptionSuccessStatus {
  subscriptionSuccessful: boolean;
  plan: PlanId;
  isTrial: boolean;
  isPaid: boolean;
  trialStartedOn: Date;
}
