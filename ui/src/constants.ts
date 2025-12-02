import { toAlphabetColumnName } from './app/services/utils/utils';

export const FloorPlanBedMapping: string[] = ['studio', '1', '2', '3', '4', '5', '6', '7'];
export const FloorPlanBathMapping: string[] = [
  '0.5',
  '1',
  '1.5',
  '2',
  '2.5',
  '3',
  '3.5',
  '4',
  '4.5',
  '5',
  '5.5',
  '6',
  '6.5',
  '7',
  '7.5',
];

export const GPRChartCategories = [
  'Gross Potential Rent',
  'Collection Loss',
  'Non - Revenue Units',
  'Concessions',
  'Physical Vacancy',
];

export const OperatingExpensesChartCategories = ['Repairs & Maintenance', 'Unit Turnovers', 'Landscaping & Grounds',
  'Contract Services', 'Security', 'Payroll', 'General & Administrative', 'Marketing & Advertising',
  'Professional & Legal Fees', 'Utilities', 'Insurance', 'Other Expenses', 'Real Estate Taxes',
  'Management Fees', 'Ground Rent', 'Other Property Taxes'];


export const workbookGlobalConfig = {
  TABLE_HEADER_COLOR: '#FFFFFF',
  TABLE_SUB_HEADER_COLOR: '#ffffff',
  TABLE_ROW_COLOR: '#ddd',
  TABLE_BORDER_COLOR: '#000000',
  TABLE_HEADER_BORDER_COLOR: '#fff',
  TABLE_START_ROW_INDEX: 6,
  TABLE_START_ROW_WITHOUT_HEADER: 1,
};

export const rrExportWorkbookSheets = {
  FLOOR_PLAN_SUMMARY: 'Floor Plan Summary',
  UNIT_TYPE_SUMMARY: 'Unit Type Summary',
  UNIT_SIZE_SUMMARY: 'Unit Size Summary',
  FLOOR_PLAN_NAME_SUMMARY: 'Floor Plan Name Summary',
  RENT_ROLL: 'Rent Roll',
};

export const rrSummaryTables = {
  RENT_SUMMARY_TABLE: {
    header: [
      { name: '', mergeColCount: null },
      { name: 'ALL UNITS', mergeColCount: null },
      { name: 'OCCUPIED UNITS', mergeColCount: 4 },
      { name: 'RECENT LEASE (By Move-In-Date)', mergeColCount: 8 },
    ],
    subHeader: [
      'Floor Plan',
      'Market Rent',
      '# Occupied',
      'Market Rent',
      'In-Place Rent',
      '% of Market Rent',
      '# Recent 5',
      'In Place Rent Avg',
      '#Leases Last 90 Days',
      'In Place Rent Avg.',
      '#Leases Last 60 Days',
      'In Place Rent Avg.',
      '#Leases Last 30 Days',
      'In Place Rent Avg.',
    ],
    allowFilter: true,
    freezeCell: false,
    hasSummaryRow: true,
    applyDefaultStyling: true,
  },
  UNIT_SUMMARY_TABLE: {
    header: [
      { name: 'UNIT INFORMATION', mergeColCount: 6 },
      { name: 'OCCUPANCY STATUS(% Of Units)', mergeColCount: 3 },
      { name: 'OCCUPANCY STATUS(No. Of Units)', mergeColCount: 3 },
      { name: 'RENOVATION STATUS', mergeColCount: 3 },
    ],
    subHeader: [
      'Floor Plan',
      'Beds',
      'Bath',
      'Square Feet',
      '#Units',
      '% Of Total Units',
      'Occupied',
      'Vacant',
      'Non Revenue',
      'Occupied.',
      'Vacant.',
      'Non Revenue.',
      'Renovated',
      'Down',
      'Un-Renovated',
    ],
    allowFilter: true,
    freezeCell: false,
    hasSummaryRow: true,
    applyDefaultStyling: true,
  },
};

export const rrDataExportTable = {
  header: [
    { name: 'UNIT INFORMATION', mergeColCount: 7 },
    { name: 'UNIT STATUS', mergeColCount: 3 },
    { name: 'CURRENT LEASE', mergeColCount: 19 },
  ],
  subHeader: [
    'Unit No.',
    'Floor Plan',
    'Unit Type',
    'Square Feet',
    'Beds',
    'Baths',
    'Market Rent',
    'Occupancy',
    'Lease Type',
    'Renovation Status',
    'Tenant Name',
    'Tenant Code',
    'Lease Start Date',
    'Lease End Date',
    'Lease Term',
    'MTM',
    'Move In Date',
    'Move Out Date',
    'Monthly Rent',
    'Garage & Parking',
    'Storage',
    'Deposit Forfeiture',
    'Pet Fees',
    'Expense Reimbursements',
    'Miscellaneous Other Income',
    'Concessions',
    'Subsidy',
    'Cable & Internet',
    'Valet Trash',
  ],
  allowFilter: true,
  freezeCell: 'I6',
  hasSummaryRow: false,
  applyDefaultStyling: true,
};

const xlsxColumns = Array.from({ length: 100 }, (_, i) => i + 1).map((k) => toAlphabetColumnName(k));

xlsxColumns.shift();

export const columns = xlsxColumns;
