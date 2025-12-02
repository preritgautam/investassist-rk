import { injectable } from '../../boot';
import { Account } from '../../db/entity/Account';
import { AccountTemplate, COA } from '../../db/entity/AccountTemplate';

const coaSortFunction = (a: COA, b: COA) => {
  const headOrder = {
    'Income': 0,
    'Expense': 1,
    'Capital Expense': 2,
    'NOI': 3,
  };

  if (a.head !== b.head) {
    return headOrder[a.head] - headOrder[b.head];
  }

  return a.category < b.category ? -1 : 1;
};

@injectable()
export class AccountTemplateManager {
  async getAccountTemplate(account: Account): Promise<AccountTemplate> {
    const templates = await account.templates;
    return templates.length > 0 ? templates[0] : null;
  }

  async getAccountCOA(account: Account) {
    const template = await this.getAccountTemplate(account);
    if (template) {
      return template.chartOfAccount.items.sort(coaSortFunction);
    }

    return DefaultCOA;
  }

  async getAccountCOASummaryDetails(account: Account) {
    const template = await this.getAccountTemplate(account);
    if (template) {
      return template.chartOfAccount.summary;
    }

    return DefaultCOASummary;
  }
}


const DefaultCOA: COA[] = [
  {
    'head': 'Income',
    'category': 'Market Rent',
  },
  {
    'head': 'Income',
    'category': 'Loss to Lease',
  },
  {
    'head': 'Income',
    'category': 'Physical Vacancy',
  },
  {
    'head': 'Income',
    'category': 'Renovation Vacancy',
  },
  {
    'head': 'Income',
    'category': 'Non - Revenue Units',
  },
  {
    'head': 'Income',
    'category': 'Concessions',
  },
  {
    'head': 'Income',
    'category': 'Collection Loss',
  },
  {
    'head': 'Income',
    'category': 'Expense Reimbursements',
  },
  {
    'head': 'Income',
    'category': 'Garage & Parking',
  },
  {
    'head': 'Income',
    'category': 'Storage',
  },
  {
    'head': 'Income',
    'category': 'Cable & Internet',
  },
  {
    'head': 'Income',
    'category': 'Valet Trash',
  },
  {
    'head': 'Income',
    'category': 'Deposit Forfeiture',
  },
  {
    'head': 'Income',
    'category': 'Pet Fees',
  },
  {
    'head': 'Income',
    'category': 'Miscellaneous Other Income',
  },
  {
    'head': 'Income',
    'category': 'Commercial Net Income',
  },
  {
    'head': 'Income',
    'category': 'Excluded Income',
  },
  {
    'head': 'Expense',
    'category': 'Repairs & Maintenance',
  },
  {
    'head': 'Expense',
    'category': 'Unit Turnovers',
  },
  {
    'head': 'Expense',
    'category': 'Landscaping & Grounds',
  },
  {
    'head': 'Expense',
    'category': 'Contract Services',
  },
  {
    'head': 'Expense',
    'category': 'Security',
  },
  {
    'head': 'Expense',
    'category': 'Payroll',
  },
  {
    'head': 'Expense',
    'category': 'General & Administrative',
  },
  {
    'head': 'Expense',
    'category': 'Marketing & Advertising',
  },
  {
    'head': 'Expense',
    'category': 'Professional & Legal Fees',
  },
  {
    'head': 'Expense',
    'category': 'Trash',
  },
  {
    'head': 'Expense',
    'category': 'Electricity',
  },
  {
    'head': 'Expense',
    'category': 'Fuel (Gas & Oil)',
  },
  {
    'head': 'Expense',
    'category': 'Water & Sewer',
  },
  {
    'head': 'Expense',
    'category': 'Other Utilities',
  },
  {
    'head': 'Expense',
    'category': 'Insurance',
  },
  {
    'head': 'Expense',
    'category': 'Reimbursements',
  },
  {
    'head': 'Expense',
    'category': 'Other Expenses',
  },
  {
    'head': 'Expense',
    'category': 'Real Estate Taxes',
  },
  {
    'head': 'Expense',
    'category': 'Management Fees',
  },
  {
    'head': 'Expense',
    'category': 'Ground Rent',
  },
  {
    'head': 'Expense',
    'category': 'Other Property Taxes',
  },
  {
    'head': 'Expense',
    'category': 'Excluded Expense',
  },
  {
    'head': 'Capital Expense',
    'category': 'Replacement Reserve',
  },
  {
    'head': 'NOI',
    'category': 'Net Operating Income',
  },
  {
    'head': 'NOI',
    'category': 'Net Cash Flow',
  },
].sort(coaSortFunction);


const DefaultCOASummary = [
  {
    'type': 'headerRow',
    'label': 'Operating Income',
    'category': 'Operating Income',
  },
  {
    'type': 'rowGroup',
    'label': 'Gross Potential Rent',
    'categories': [
      'Market Rent',
      'Loss to Lease',
    ],
  },
  {
    'type': 'rowGroup',
    'label': 'Base Rental Income',
    'categories': [
      'Market Rent',
      'Loss to Lease',
      'Physical Vacancy',
      'Renovation Vacancy',
      'Non - Revenue Units',
      'Concessions',
      'Collection Loss',
    ],
  },
  {
    'type': 'rowGroup',
    'label': 'Other Income',
    'categories': [
      'Expense Reimbursements',
      'Garage & Parking',
      'Storage',
      'Cable & Internet',
      'Valet Trash',
      'Deposit Forfeiture',
      'Pet Fees',
      'Miscellaneous Other Income',
      'Commercial Net Income',
    ],
  },
  {
    'type': 'totalRow',
    'label': 'Effective Gross Income',
    'categories': [
      'Base Rental Income',
      'Other Income',
    ],
  },
  {
    'type': 'headerRow',
    'label': 'Operating Expense',
    'category': 'Operating Expense',
  },
  {
    'type': 'rowGroup',
    'label': 'Controllable Expenses',
    'categories': [
      'Repairs & Maintenance',
      'Unit Turnovers',
      'Landscaping & Grounds',
      'Contract Services',
      'Security',
      'Payroll',
      'General & Administrative',
      'Marketing & Advertising',
      'Professional & Legal Fees',
    ],
  },
  {
    'type': 'rowGroup',
    'label': 'Non - Controllable Expenses',
    'categories': [
      'Trash',
      'Electricity',
      'Fuel (Gas & Oil)',
      'Water & Sewer',
      'Other Utilities',
      'Insurance',
      'Reimbursements',
      'Other Expenses',
    ],
  },
  {
    'type': 'rowGroup',
    'label': 'Fixed Expenses',
    'categories': [
      'Real Estate Taxes',
      'Management Fees',
      'Ground Rent',
      'Other Property Taxes',
    ],
  },
  {
    'type': 'totalRow',
    'label': 'Total Operating Expenses',
    'categories': [
      'Controllable Expenses',
      'Non - Controllable Expenses',
      'Fixed Expenses',
    ],
  },
  {
    'type': 'totalRow',
    'label': 'Net Operating Income (Pre Reserves)',
    'categories': [
      'Effective Gross Income',
      'Total Operating Expenses',
    ],
    'rowSigns': [
      1,
      -1,
    ],
  },
  {
    'type': 'headerRow',
    'label': 'Capital Expenditure',
    'category': 'Capital Expenditure',
  },
  {
    'type': 'rowGroup',
    'label': 'CapEx',
    'categories': ['Replacement Reserve'],
  },
  {
    'type': 'totalRow',
    'label': 'Net Operating Income (Post Reserves)',
    'categories': [
      'Net Operating Income (Pre Reserves)',
      'CapEx',
    ],
    'rowSigns': [
      1,
      -1,
    ],
  },
  {
    'type': 'headerRow',
    'label': 'Excluded Items',
    'category': 'Excluded Items',
  },
  {
    'type': 'rowGroup',
    'label': null,
    'categories': [
      'Excluded Income',
      'Excluded Expense',
    ],
  },
  {
    'type': 'totalRow',
    'label': 'Net Cash Flow',
    'categories': [
      'Net Operating Income (Post Reserves)',
      'Excluded Income',
      'Excluded Expense',
    ],
    'rowSigns': [
      1,
      1,
      -1,
    ],
  },
];
