export type HeadCategory = {
    head: string;
    category: string;
}

const CashFlowCategories: HeadCategory[] = [
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
].sort((a: HeadCategory, b: HeadCategory) => {
  if (a.head !== b.head) {
    if (a.head === 'Income') return -1;
    if (b.head === 'Income') return 1;
    if (a.head === 'Expense') return -1;
    if (b.head === 'Expense') return 1;
    if (a.head === 'Capital Expense') return -1;
    if (b.head === 'Capital Expense') return 1;
    if (a.head === 'NOI') return -1;
    if (b.head === 'NOI') return 1;
  }

  if (a.category < b.category) {
    return -1;
  }

  return 1;
});

export const HeadCategories = CashFlowCategories.reduce(
  (obj: Record<string, string[]>, { head, category }: HeadCategory) => {
    obj[head] = obj[head] ?? [];
    obj[head].push(category);
    return obj;
  },
  {},
);
