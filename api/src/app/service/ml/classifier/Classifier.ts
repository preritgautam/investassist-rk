import AbstractClassifyHandler from './AbstractClassifyHandler';
import { flat, parallel } from 'radash';
import { inject, injectable } from '../../../boot';
import { VertexClassifier } from './VertexClassifier';

export interface LineItemType {
  lineItem: string;
  amount: number;
}

export interface ClassifiedLineItemType extends LineItemType {
  head: string;
  category: string;
  subcategory: string;
}

@injectable()
export class Classifier {
  constructor(
    @inject(VertexClassifier) private readonly classifyHandler: AbstractClassifyHandler,
  ) {}

  async classifyLineItems(lineItems: LineItemType[], coa: string[]): Promise<ClassifiedLineItemType[]> {
    const chunkSize = 500;
    const chunkedLineItems: [number, LineItemType[]][] = [];
    for (let i = 0; i < lineItems.length; i += chunkSize) {
      chunkedLineItems.push([i, lineItems.slice(i, i + chunkSize)]);
    }

    const finalResult: ClassifiedLineItemType[][] = [];

    await parallel(1, chunkedLineItems, async (indexedChunk) => {
      const [index, chunk] = indexedChunk;
      const classifiedLineItems = await this._classifyLineItems(chunk, coa);
      finalResult[index] = classifiedLineItems;
    });

    return flat(finalResult);
  }

  private parseResponseText(responseText: string): Record<string, string> {
    const rows = responseText.split('\n').slice(1);

    const responseObject = rows.reduce((obj: Record<string, string>, text: string) => {
      const [lineItem, head, category, subCategory] = text.split(',');
      obj[lineItem] = `${head} | ${category} | ${subCategory}`;
      return obj;
    }, {});
    return responseObject;
  }

  private async _classifyLineItems(lineItems: LineItemType[], coa: string[]): Promise<ClassifiedLineItemType[]> {
    const prompt = this.buildPrompt(coa, lineItems);
    const responseText = await this.classifyHandler.classifyLineItems(prompt);
    const response = this.parseResponseText(responseText);

    const classifiedLineItems: ClassifiedLineItemType[] = (Reflect.ownKeys(response) as string[])
      .map((fullLineItem: string) => {
        let lineItem = fullLineItem;
        lineItem = lineItem ? lineItem.replace('"', '').trim() : '';
        let [head, category, subcategory] = response[fullLineItem].split('|');
        head = head.trim();
        category = category.trim();
        subcategory = subcategory.trim();
        return {
          lineItem,
          head,
          category,
          subcategory,
          amount: 0,
        };
      });

    return classifiedLineItems;
  }

  private buildPrompt(coa: string[], lineItems: LineItemType[]): string {
    return `
You're a commercial real estate analyst, who works as a underwriter and create the property valuation models for the 
following departments 
A) Loan Servicing/Asset management/ Financial statement analysis for a Quarterly reviews 
B) Property valuation for Lending or Acquisitions 
C) Property appraisal for Valuation and advisory groups

Use your knowledge to the best of their ability and complete the following task provided in following tags <task></task>

<task>

The following text enclosed in <coa></coa> tags is a comma-separated list of charts of accounts for multifamily profit 
and loss statements. Each chart of account includes a combination of head, category, and subcategory separated by a | 
character.
  
<coa>
${coa.join(',')}
</coa>


Using the mentioned chart of accounts, list and classify the line items from the csv data of the profit and loss 
statement enclosed in the <pnl></pnl> tags.
<pnl>
Line Item,Amount
${lineItems.map((l) => `${l.lineItem}, ${l.amount}`).join('\n')}
</pnl>



Few things to consider when classifying the line items:

1. Consider the structure of the profit and loss statement and do not classify any item that could be a heading 
sub-heading ,totals, or sub-totals in the data.

An item typically should be considered as heading or subheadings if there is
  a) No dollar values in amount column for the responding item 
  b) Not 100%, but it's been noticed at several instances that typically headings and sub-heading will also be in Upper 
  case alphabets, this should only be considered as last resort while finding the headings and sub-heading in the pnl 
  data.
An item should be considered totals and sub-totals
  a) If it consists of words like total, net, etc.
  b) If the value in the amount column matches the total of the above listed items between this the current item and the
   last predicted heading or sub-heading.
  c) Not 100% but it's been noticed at several instances that typically Totals and Sub-Totals will also be in Upper case
   alphabets, this should only be considered as last resort while finding the totals and sub-totals in the pnl data.

In case the item listed is a heading, sub-heading, totals, or subtotal do not classify the items however it should be a
 part of the output sequence. Maintaining the sequence of items including heading, sub-heading, totals and sub-totals 
 the way it is given in the text in <pnl></pnl> is crucial.

2. When classifying the line items consider the headings and subheadings and classify the line items accordingly just
 as an example if a same line items is provided under different subheadings or heading it should be classified 
 accordingly into different categories and sub-categories.

3. Any line item which is not a part of property-related income or expense will be classified as an Excluded Income or 
 Excluded expense. Following data in the <excludedIncome></excludedIncome> tags is sample items that could be a part 
 of Excluded Income and <excludedExpense></excludedExpense> tags is sample items that could be a part of Excluded 
 Expense. These are just sample items and should not be considered as the only list that needs to be referenced for, 
 take the best use of knowledge for underwriting a commercial real estate asset for the purpose of 
  a) Loan Servicing/Asset management/ Financial statement analysis for a Quarterly review
  b) For property valuation for Lending or Acquisitions  
  c) Property appraisal for Valuation and advisory group
  
<excludedIncome>
3320 Prepaid Rent-Net Activity
3587 Interest/Investment Income
4000-0100 CORPORATE & PARTNERSHIP
4006 Interest Income
4081 - Beginning Prepaid
4085 + Ending Prepaid
4091 + Beginning Delinquent
4095 - Ending Delinquent
4097 Prior Period Rent Adjustment
41 10-0000 Gain/Loss Sale-Securily
4100-0000 Interest Income
4100-0000 lnterest Income
4102-0000 Dividend Income
4102·0000 Dividend Income
4110-0000 Gain/Loss Sale-Security
4115 - Bank Account Interest Income
4165 - Interest Income
4172 Security Deposit Interest
4200-0000 Partnership lncome(Loss)
42675 · Partnership EE Rent(s)
4317 - INTEREST INCOME
4317 INTEREST INCOME
4320 Interest Income
4390 Other Non Prop Related Inc
4520 Renters Insurance Premium
45200-00000 SECURITY DEPOSIT INTEREST
45280 Interest from Reserves
4645 Interest Income
47000 - Interest Income
4810-02 - Interest Income
4876.000 - Renters Insurance
4999 Beginning Balance
5151 Prior Period Adjustments
5275-00 - Interest Income
5285-0000 - Interest Income
52955 - Adj Dep in Transit
52955 Adj Dep in Transit
5399 Change in A/R
5410 INTEREST INCOME - PROJECT OPERATION
5410-0000 Interest Income
5410-0000 Interest Revenue-Project
54100 Interest Revenue
54110 - Interest Income - Reserves
54110 Interest Income - Reserves
5430 INCOME FROM INVEST. - RESIDUAL RECEI
5440 INCOME FROM INVESTMENTS
5440-0000 Interest Inc - Repl Reserve
5440-0000 Interest Revenue-RepRes
5475-0000 Interest-Escrowed Security Dep
5490-0000 Interest Income - Misc
56400000 Scre:eninc fks on Tt nantJ
57500000 Sec. Dep. Forfeitu
5904 Interest - operations
5959 - Bank Interest Income
7% of outstanding balance
70302 · interest income - #32 Geraldo
70303 · Interest income - #46 (2150)
7725 Sale of Asset
Accounts Receivable
Advance Rent Collections
Bank Interest
Bank Interest Income
Bexis
Capital Gain Distribution
Consulting Fee
DONATIONS
Deferred Leasing Cost Amortization
Delinquent - Beginning
Delinquent - Charged Off
Delinquent - Ending
Delinquent Rent
Delinquent Voucher Rent
Director's Fee
Dividend Income
Dividends
Donations
Donations A
Donations- non-cash
Ending Prepaid
FINANCIAL INCOME
FINANCIAL REV-OPERATIONS
FINANCIAL REV-RESERVE
Fed-Ex
Financial Revenue - Operations
Financial Revenue-Security Dep
Gain on Contributions
Gain/Loss Sale of Fixed Assets
Gain/Loss: Sale of Property
General and Administrative
Guarantee Fees
Home Payment
INCOME
INT - RESERVE FOR REPLACEMENT
INT - RESIDUAL RECEIPTS
INTEREST EARNED
INTEREST FROM OPERATIONS
INTEREST INCOME
INTEREST INCOME REPL RES
INTEREST INCOME REPLACEMENT RESERVE
INTEREST INCOME SECURITY
INTEREST INCOME SECURITY DEPOSIT
INTEREST INCOME- (RES)
INTEREST INCOME-OPERATIONS
INTEREST-INVESTM
Income - Interest
Income Reconciliation Account
Income Reconciliation Acct
Income/Loss from JV Inv's
Insurance
Insurance - Supplemental Claims
Insurance Claims
Insurance Claims Proceeds
Insurance Commissions
Insurance Repayments
Intererst
Interest
Interest - Holdback
Interest - Security Deposits
Interest - Tax Free
Interest Earned
Interest Holdback Account
Interest Inc
Interest Inc - Operating
Interest Inc-Op Reserves
Interest Inc-Operating Reserve
Interest Inc-Painting Reserves
Interest Inc-Replacement Res.
Interest Inc-Residual Receipts
Interest Income
Interest Income (Sec Dep)
Interest Income - Replacement Reserves
Interest Income - Replacement Rsrv
Interest Income - Reserves
Interest Income - Trustee
Interest Income K1'S
Interest Income Preferred Rtn
Interest Income R/R
Interest Income Riverfarm
Interest Income Security
Interest Income Security Deposits
Interest Income Shaws Debt
Interest Income- Operating
Interest Income- Security Deposit
Interest Income-Debt Service Rsrv
Interest Income-Insurance Escrow
Interest Income-Investments
Interest Income-Misc.
Interest Income-Operating
Interest Income-Operations
Interest Income-Partnership
Interest Income-Repl Reser
Interest Income-Replacement Reserve
Interest Income-Reserves
Interest Income-Security Deposits
Interest Income-Tax Escrow
Interest Revenue
Interest Revenue - Operations
Interest Revenue Project Oper
Interest Revenue-Project
Interest Revenue-RepRes
Interest from Reserves
Interest lncome-Reserve Repl
Interest on Bank Accounts
Interest revenue-Reserve Replac
Interest-Misc./Operating
Interest/Investment Income
Internet Income
K-1 Income
Lakeside Apartments [Rent less N/P]
Less Sales Tax
Long Tern Gain
Management Fees
Marketing
Miscellaneous Income & Sale of Lakeside
Net Delinquency
Net Income (Loss)
Net PrePaid
OTHER FINANCIAL INCOME
54110 - Interest Income - Reserves
Other Investment Income
PREPAID RENT
PREPAID RENT INCOME
Payroll
Penalties/Forfeitures
Plus Prepaid Rent
Plus: Prepaid Rent
Plus: Prepayments
Preferred Return on Equity
Prep. Rent(Beg.) Ending
Prepaid Rent
Prepaid Rent - Beginning
Prepaid Rent - Ending
Prepaid Rent Liability
Prepaid Rent-Net Activity
Prepaid Rent/Delinquent
Prepaid Sect.8
Prepaid- Local Assist.
Prepaid--Local Assist.
Prepayment Forfeit
Prior Mth Deliquent Rent
Prior Period Rent Adjustment
Prior Rent-HUD
Prior Rent-Tenant
Proceeds - Sale of Property
RENTER PROTECTION
RENTER'S INSURANCE
RETAINED DEPOSITS
Renter'S Insurance
Renter's Insurance
Renters Ins. Waiver
Renters Insurance
Renters' Insurance Commission
Restructured Note Interest
Retained Deposit
Retained Deposits
Retained Excess Income
Retained/Refunded Deposit
Return on Equity
Revenue from investments - reserve for replacements
Revenue from investments - residual receipts
Sales
Sales Comm List Co-Op Sale
Sales Comm Sale Co-Op List
Sales Commissions
Sales Commissions List & Sale
Sales Commissions New Homes
Sales Tax Income
Sales/Use Tax
Security Deposit Interest
Security Deposit Interest Income
Subsidy Rec-Beg. (End
TIF - Tenant Insurance Fee
TIP - Tenant Insurance Premium
Tax Reserve Interest
Taxes
"Total Forfeited Security Depos,"
Trust Annuity Income
UNDEPOSITED FUNDS
"lnte,est Income"
lnterest Revenue-Project
lnterest Revenue-RepRes
 </excludedIncome>
 <excludedExpense>
 Line Item
(DISTRIB) CONTRIB
(Gain)/Loss on Sale
1118-0000 - REPLACEMENT RESERVE
1123-1100 R&R Interest
1264 - Interest Rate Hedge Escrow
1269 - Sinking Fund Escrow
1310-1000 Hazard Insurance Escrow
1310-2000 Mort. Ins. Escrow 1st Tru
1310-3000 Real Estate Tax Escrow
1320-1000 Repl Res 1st Deposit
1320-2000 Repl Res 1st Interest
1630-00 - Utility Deposits
1635-00 - Mortgage Tax Escrow
1636-00 - Mortgage Insurance Escrow
1637-00 - Mortgage Replacement Escrow
1St Mortgage - Interest Expense
1st Debt Interest Expense
1st Mort Principal Reduction
1st Mortgage - Interest
1st Mortgage - Payment
1st Mortgage - Principal
1st Mortgage Intere
1st Mortgage Interest
1st Mortgage Interest Expense
1st Mortgage Note
1st Mortgage Payable
1st Mortgage-Interest
1st Mortgage-Principal
1st TD Payable-Paydown
1st Trust Deed
1st Trust Deed-Int
1st Trust Deed-Prin
2215 - Mortgage Payable LT
2320-0000 Principal 1st Mort
2510-10 - Note Payable - Principal Payments
2600-10 - Mortgage Loan 1 - Payment
2nd TD Payable-Paydown
30300 Total Gain (Loss) on Sales of Investment
30315 Fixed Asset Sales
30316 Cost of Fixed Asset Sales
4782 Uninsurred Loss/Gain
4855 Interest Expense
5007 Mortgage Interest
50103 County Taxes
50542 Vendor Finance Charges
5111 Bank Recon Adjustments
5125 Depreciation Expense
5410-0000 Amortizahon
5480-0000 Depreciation
5620-0000 Interest-Mortgage
5621-0000 Interest - NIP
5625-0000 PMI Expense
5630-0000 lnleres1-0ther NIP
5631-0000 lnteresl-Other NIP
5635-0000 loan Repayment Fee
5655 Less:EE benefits capitalized
57500000 Sec. Dep. Forfeitu
5770 Incentive Pay
5805-0000 Taxes•State Income
5811 Deferred Prop Mgmt Fee
5815-0000 Taxes-Personal ProPerty
5821 Deferred Asset Mgmt Fee
5830 Partner Mgmt Fee
5831 Deferred Partner Mgmt Fee
59550 · Service Charge/Interest
6002-00 - Personal Property Tax
6005-00 - Suspended Capital
6010-0000 Insurance Deductible
6015-0000 Ins_ Proceeds-Repairs
6031 Personal Property Tax
6100~0000 Investment Fees
6101-00 - Interest Expense
6120 State Income Tax
6125 City Income Tax
61770 - Asset Mgt Fee
62010 Personal Property Taxes
62010-001 - Ad Valorem Prop Taxes - Prior Year
6230 Mortgage Interest Expense
62400 · Depreciation Expense
6325 - Partner/GP Incent Mgmt Fees
63399 · Conerstone Interest exp
63400 · Interest Expense - Alliant
63411 · Interest LID
6501-00 - Depreciation Exp - Bldg
6501-02 - Depreciation Exp - Land Imprmnts
6502-00 - Depreciation Exp - FF&E
6503-00 - Depreciation Exp - Automobiles
6504-00 - Amortization
6504-01 - Amortization - Software
6633 Interest - security deposits
6690 Reconciliation Discrepancies
66900 · Reconciliation Discrepancies
67030 - Corporation Tax
67030 Corporation Tax
67050 - Franchise Tax
67050 Franchise Tax
67090 Personal Property Tax
6710 Interest Expense
67100 - Interest - Loan 1
67160 - State Income & Franchise Tax
6719-1000 LIHTC Monitoring Fees
6890-3000 Interest On Sec Dep
6722 PERSONAL PROPERTY
6812-0000 Interest - 1st Mortgage
6820 - Interest Expense
6820 INTEREST ON MORTGAGE PAYABLE
6820-1000 Interest 1st Mort
68200 - Interest on Mortgage
68200 - Mortgage Interest
68200 Interest on Mortgage
6821-0000 Interest Given - Security Deposit
68210 Principal Payment
68250 - Replacement Reserve Escrow
68250 Replacement Reserve Escrow
68320 Deferred Reimbursement
68330 - Insurance Reimbursement
68330 Insurance Reimbursement
68340 - Insurance Claims
68340 Insurance Claims
68350 Loan Closing Costs
68360 Misc Debt Admin Fees
6850-0000 Mortgage Insurance Premium
6890 MISCELLANEOUS FINANCIAL EXPENSES
6895-0000 Depreciation
6899 - Other Financial Expense
69400 - Depreciation Expense
69501 - Amortization Expense
7100-80 - Partnership Legal Expenses
7102-00 - Prior Year Adjustments
7108-00 - Partnership Expenses
7135-00 - Franchise Tax
7163 Mortgage Int-Alliant
7163B Mortgage Interest 2nd
7164 Mortgage
7165 2nd Mort.
7300-00 - Interest Expense
73010000 N/R-Home rem<
73020000 N/R-nondepr pe
73020000 N/R-nondepr personal prop
73020000 NIR-nondepr pe
73040000 N/R-<ither nonb1
73040000 N/R-other nonb1
73040000 N/R-other nonbr
73040000 N/R-other nonbudgeted
73050000 N/R - prior year
73050000 N/R - prior year invoices
73050000 NIR - prior year
7310 - INTEREST-MORTGAGE
7310 Interest - Mortgage
7350 Mortgage Interest
7353 - DEPRECIATION EXPENSE
7353 • DEPRECIATION EXPENSE
73990000 N/R (Non Recurrir
73990000 Total N/R (Non
7403 - FRANCHISE TAX
7404 - PARTNERSHIP EXPENSES
7404 Partnership Expense
7404 • PARTNERSHIP EXPENSES
7409 Partner Distribution
7510 Interest Expense - Mortgage
7510 · Interest Expense - Timberland
7510 · Mortage Principal & Interest
7511 Mortage Principal & Interest
75600 Prior Mgmt Co - Expenses
7850-0000 - OWNERS MISC EXP
7900-00 - Extraordinary Expenses
8000 - Depreciation - FF&E
80002 Mortgage Interest
8003 - Amortization - Loan Fees/
8005 - Deprec Expense-Building
8006 - Amortization-Tax Credit Fees
8010-0000 Loss on Sale of Assets
8015-0000 Sales Comm1ss1on E)(p
8080.000 - Mortgage Interest
8105 - Interest Expense - Notes Paybl
8107 - Interest Expense-Other
8110 - Cost of Financing
8120 - Ownership Expenses
8130 - Depreciation & Amortization
82000 DEPRECIATION AND AMORTIZATION
82005 Amortization Expense
82017 Depreciation Expense - Building
82801 Interest Expense
8610 1st Trust Deed-Interest
8620 1st Trust Deed·Principal
86540 Amortization
86542 Depreciation
8680 Property Tax Impounds
8730 Personal Property Tax
8876-0000 - MORTGAGE A PRINCIPAL PAYMENT
8877-0000 - MORTGAGE A-INTEREST
9005 · Interest Exp Note A-1
9010 · Interest Exp-Note A-2
9015 · Interest Exp-Note B
90160 Other Partnership Administrative
90170 Depreciation
90500-00000 MORTGAGE INTEREST - 1ST TRUST
97180 Amortization
9925-00 - Partnership Fees
ACCOUNTS PAYABLE
ACCOUNTS RECEIVABLE - SW APTS
ADA Lawsuit
AITD Payable
AMORIZATION-DEFERRED COST
AMORIZATION-OEFERRED COST
AMORTIZATION
AMORTIZATION & DEPRECIATION
AMORTIZATION - LOAN COSTS
AMORTIZATION - MORTGAGE COSTS
AMORTIZATION EXPENSE
AMORTIZATION- DEBT COSTS
AMORTIZATION- FINANCING COSTS
AQUISTION-FIXED ASSETS
ASSET MGMT FEE
ASSET MGT FEE-AFFILIATE
AUM CHRGS/PRIOR REIMB
Accounts Receivable
Accrued Capital Asset
Accrued Expense
Accrued Franchise Taxes
Accrued Management Fees
Accrued Payroll
Accrued R.E. Tax Payable
Accrued Real Estate Taxes
Accrued Real Property Taxes
Accum Amort - Loan Costs
Accum Depr - Other
Accum. Amortization-Assets
Accum. Depree. - Fixed Assets
Acq Transaction Costs
Acquisition Costs
Acquisition Expense
Ad Valorem Prop Taxes - Prior Year
Advance
Amort - Loan Fees
Amort Expense
Amort. -Mortg/Loan Closing Costs
Amortization
Amortization - Loan Costs
Amortization - Software
Amortization Exp-CANT
Amortization Exp-MVC
Amortization Expense
Amortization Expenses
Amortization-Financing Costs
Amortization-Loan Orig Fees
Amortization-Mortgage Costs
Amortization-loan costs
Asset Management Fee I/E
Asset Mgmt Fee
Asset Mgmt Fees
BENEFIT RESERVE
Bank Recon Adjustments
Bank Reconciliation Adjustment
Bereavement
BlackhaWk Interest
BlackhaWk Principal
Blackhawk Principal
Blackhawk lnlersst
Bond Fees
Bond Interest
Business taxes
CALIF FRANCHISE TAX
CAPITAL ESCROW RESERVE
CHARITY
CONTRIBUTIONS/GRANTS
CURR PORTION- MORTGAGE FIRST
CURRENT YEAR PAYABLES
CURRENT YEAR PREPAIDS
CURRENT YEAR RECEIVABLES
Capitalized Expenditures
Cash-Insurance Escrow
Cash-Insurance Escrow Withdrawals
Cash-Tax Escrow
Cash-Tax Escrow Withdrawals
Common Areas Unbudgeted
Corporation Tax
Cost of Fixed Asset Sales
DEBT SERVICE
Principal 1st Mort
DEBT SERVICE
DEBT SERVICE (Interest Expense)
DEPR & AMORT
DEPR & AMORT EXPENSE
DEPREC EXP- BUILDING & IMPROVE
DEPRECIATION
DEPRECIATION AND AMORTIZATION
DEPRECIATION EXPENSE
DEPRECIATION EXPENSES
DEPRECIATION- BUILDING
DEPRECIATION-BUILDING
Debt Recovery Fees
Debt Service
Debt Service - Interest
Debt Service - Interest - 1st
Debt Service - MIP Expense
Debt Service Bedrock
Debt Service Expense
Debt Services
Deferred Int on Note - LT
Deposit Refunds
Deposit Reimbursement
Deposit refund
Deprec - Buildings
Depreciation
Depreciation & Amortization
Depreciation & Amortization Expense
Depreciation - Bldg Equipment
Depreciation - Building
Depreciation - Furniture & Fixtures
Depreciation - Improvements
Depreciation - Land Improvements
Depreciation - Real Property
Depreciation Exp - Automobiles
Depreciation Exp - Bldg
Depreciation Exp - F&E
Depreciation Exp - FF&E
Depreciation Exp - Land Imprmnts
Depreciation Exp-MVC
Depreciation Expense
Depreciation Expense - Building
Depreciation Expense-C
Depreciation Expenses
Depreciation and Amortization
Depreciation- Equipment
Depreciation-Building
Depreciation-Building Improvements
Depreciation-Cap Improvement
Depreciation-FF&E
Depreciation-Land Improvements
Depreciation-Landscaping
Depreciation-Personal Property
Depreciation-Real Property
Depreciation/Amortization
Distribution
Donations
Donations/Contributions
ENTITY EXPENSES
ESCROW - HAZARD I
ESCROW - MIP
ESCROW INSURANCE
ESCROW PROPERTY T
ESCROW TAXES
ESCROW-REAL ESTATE TAXES & INSURANCE
ESSCROW PROPERTY
Escrow -- Net after Taxes & Insurance
Escrow Expenses
Escrow Real Estate Truces and Insurance
Exterior Upgrades Unbudgeted
Extraordinary Cost Unbudgeted
Extraordinary Expenses
Extraordinary Items
FINANCE CHARGES
FINANCE CHG & PENALTY
FIRST MTG - CSFB
FORFEITED SECURITY DEP.
FRANCHISE TAX
FRANCHISE TAX EXP
Fin Cost Amortization
Finance Charge
Finance Charges
 68200 - Interest on Mortgage
Financial Expense
Financial Expenses Misc
Financing Fees
Fire & Liability - Reserve
Fire/Storm/Flood/Prop.Ins. Claims
First Mortgage
First Mortgage Interest
First Mortgage Principal
Fixed Asset Sales
Fixed Expense
Franchise / Excise / BPT Tax
Franchise Tax
Franchise Taxes
Franchise taxes
Franchise/Margin taxes
Francise Tax Board
Gain-Loss on Sale
Gain/(Loss) on Rate Cap
Gain/Loss Investments
Gain/Loss: Sale of Property
Gross Receipts Tax
Ground Lease Interest - I/E (Soft)
Ground Lease Rent - I/E (Soft)
HOA Dues/Mtg Insurance
Hazard Insurance Escrow
Home Taxes
IL MUTUAL-Mortgage Pmt
"IN,TERESTON HUD LOAN"
INCENTIVE FEE
INSURANCE CLAIMS
INSURANCE CLAIMS EXPENSES
INSURANCE ESCROW
INSURANCE IMPOUND
INSURANCE ON MORTGAGE
INSURANCE-ESCROW
INT EXP - FIRST MORTGAGE
INTEREST
INTEREST & FINANCING EXPENSE
INTEREST - D/S
INTEREST D/D NOTE
INTEREST ESCROW
INTEREST EXPENSE
INTEREST EXPENSE- NOTES PAYABLE
INTEREST NOTE D/R
INTEREST ON 1ST MORTGAGE
INTEREST ON MORT. PAY
INTEREST ON MORTGAGE
INTEREST ON MORTGAGE PAYABLE
INTEREST · OTHER
INTEREST-LINCOLN NAT'L
INTEREST-MORTGAGE
INTEREST-MORTGAGE LENDER
INTEREST-OTHER
INTEREST-SECURITY DEPOSIT
Incentives
Income (Loss) from Investments
Income Tax-State
Income Taxes
Ins. Proceeds-Repairs
Insurance - Claims/Deductible
Insurance Claim or Loss
Insurance Deductibles/Other
Insurance Escrow
"Insurance, Etc Proceeds"
Insured Loss - Expense
Int On Mortgage Payable
Interest
Interest - 1st
Interest - 1st Mortgage
Interest - Keycorp
Interest - Keycorp 2nd Mortgage
Interest - Loan 1
Interest - Loan 2
Interest - Note #2
Interest - Other
Interest - Security Deposits
Interest 1st Mort
Interest 1st Mtg
Interest Earned
Interest Earned - Escrow
Interest Exp - First Mortgage
Interest Exp -Notes Payable
Interest Exp-CANT
Interest Exp-MIP
Interest Exp-MVC
Interest Expense
Interest Expense - 1st Lien
Interest Expense - 1st Mortgage
Interest Expense - 2nd Lien
Interest Expense - 3rd Lien
Interest Expense - 4th Lien
Interest Expense - AHP Loan
Interest Expense - GSL Partners
Interest Expense - HOME
Interest Expense - Mortgage
Interest Expense - Note
Interest Expense - Note #1
Interest Expense - Oregon Housing
Interest Expense - Other
Interest Expense - Pillar
Interest Expense - Senior Debt
Interest Expense Letters of Credit
Interest Expense Other
Interest Expense- Mortgage Pay
Interest Expense-1st Mortgage Note
Interest Expense-1st Trst Deed
Interest Expense-ACORE
Interest Expense-ACORE - Other
Interest Expense-Loan Fees
Interest Expense-Note Payable
Interest Expense-Paid 1st Mortgage
Interest First Trust Deed
Interest Given - Security Deposit
Interest Income
Interest Income - Replacement Rsrv
Interest Income Other Reserve
Interest Income Replacement Reserve (HUD)
Interest Income-Debt Service Rsrv
Interest Mortgage
Interest Rate Hedge Escrow
Interest Reserves
Interest Second Trust Deed
Interest expense
Interest on First Mortgage
Interest on Mortgage
Interest on Mortgage Payable
Interest on Notes Payable
Interest on Sec Dep
Interest on Security Deposit
Interest on Security Deposits
Interest on mortgage payable
Interest • Investment
Interest- Morgage
Interest- Mortgage Payable
Interest- Security Deposits
Interest-2nd Mortgage
Interest-Mortgage
Interest-Other
Interest-Other N/P
Interest-Other NIP
Interest-Second Mortgage
Interest-Third Mortgage
Interst-Mortgage Payable
Investment Fees
LEGAL - PARTNERSHIP
LLC Annual Filing Fee
LLC-Related Expenses
LOAN P'BLE-LINCOLN NAT'L L
LOAN PAYMENT
Late Fee Payable
Late Fees / Penalty / Interest
Late Fees/Finance Charges
Late/Finance Charges
Legal Fee - Non Operating
Legal Fees - Partnership / Owner
Legal Project Fees
Liability
Loan & Refinancig Costs
Loan APC
Loan Cost Amortization
Loan Costs
Loan Fees
Loan JCM
Loan Payable
Loan Repayment fee
Loan/Refinance Fees
Loss on Sale of Assets
MAINT RESERVE
MAINTENANCE RESERVE
MIP Escrow
MISC INT/DIVIDEND INC
MISC INTEREST EXPENSE
MISC. FINANCIAL EXPENSE
MISCELLANEOUS FINANCIAL EXPENSES
MORTGAGE AMORTIZATION
MORTGAGE INSURANCE
MORTGAGE INTEREST
MORTGAGE INTEREST-FIRST
MORTGAGE PAYABLE
MORTGAGE PAYABLE II
MORTGAGE PAYMENT
MORTGAGE PRINCIPA
MORTGAGE SERVICE CHARGE
MORTGATE INTEREST
MTGE INTEREST -1ST
MTGE INTEREST -3RD
Maintenance Reserve
Maintenanoa Reserve
Marketing- Charitable
Michigan Business Tax
Misc Non-Operating Expense
Misc OP & maint exp-Prior Management
Misc. Financial Expense
Misc. Financial Expenses
Miscellaneous Financial Exp
Miscellaneous Financial Expenses
Miscellaneous Income
Mort. Interest-1st Mort
Mortage / Tax
Mortage Principal & Interest
Mortgage
Mortgage - First
Mortgage - Interest
Mortgage - Principal
Mortgage Amortization
Mortgage Expense
Mortgage Ins. Premium
Mortgage Insurance
Mortgage Insurance Escrow
Mortgage Insurance Premium
Mortgage Insurance Premium (MIP)
Mortgage Insurance Premiums
Mortgage Int-Alliant
Mortgage Int.-Alliant
Mortgage Interest
Mortgage Interest -$
Mortgage Interest -1st Loan
Mortgage Interest 2nd
Mortgage Interest Expense
Mortgage Interest Loan #2
Mortgage Interest Primary
Mortgage Note Interest
Mortgage Payable
Mortgage Payable D
Mortgage Principal
Mortgage Replacement Escrow
Mortgage Service Charges
Mortgage Service Fees-1st Mortgage
Mortgage Tax Escrow
Mortgage insurance premium/service charge
Mortgage interest
Mortgage interest expense
Mortgage interest-form 1098
Mortgage/Interest Payment
NET CHANGE A/P
NET CHANGE ACCR OTHER
NET CHANGE ACCR PR
NET CHANGE ACCR RE TAX
NET CHANGE IN SEC DEP
NET CHANGE PP INSUR
NET CHANGE PP OTHERS
NON-OPER ASSET MGMT FEES
NONSITE USE-INS CLAIM/DMG
Net operating income
Non Recurring
Non-Budgeted Expense
Non-Recurring Marketing
Non-Routine Capital Expense
Note 1 Interest
Note Payable
Note Payable - Principal Payments
Notes Pay - Partners (2004)
Notes Payable 2nd
OFFICE RESERVE
OTHER ESCROW
OTHER MORTGAGE EXP - TEM
OTHER NON-RECURRING
OTHER OWNER/PARTNERSHIP FEES
OTHER OWNERSHIP EXPENSE
OWNER EXPENSE
OWNER FILING FEES
OWNER INVESTMENT
OWNER/PARTNER AUDIT FEES
OWNER/PARTNER LEGAL FEES
OWNER/PARTNER TAX CONSULTING FEE
OWNERS CONTRIBUTION
OWNERS WITHDRAWAL
OWNERSHIP LEGAL
Other Debt Services
Other Deposits
Other Entity Expenses
Other Financial Expense
Other Financial Expenses
Other Interest
Other Loan Interest
Other Non-Operating Expense
Other Non-Operating Income/Expense
Other Owner Expense
Other Owner Expenses
Other Owner Income
Other Start Up Expense
Owner Fees
Ownership Accounting
Ownership Expenses
Ownership Legal Fees
Ownership Refinance
P&I on Mortgage Payable
PARTNER & PROFESSIONAL FEES
PARTNERSHIP AUDIT TAX RETURN
PARTNERSHIP EXPENSES
PARTNERSHIP LEGAL EXPENSE
PENALTIES
PERS PROP TAX EXPENSE
PERSONAL PROP TAX
PERSONAL PROPERTY
PERSONAL PROPERTY TAX
PERSONAL PROPERTY TAXES
PR TAX RESERVE
PRINC REDUCT OR (DRAW)
PRINCIPAL
PRINCIPAL - MORTGAGE
PRINCIPAL DEBT PAYMENTS
PRINCIPAL/RESRV REDUCTION
PRIOR YEAR PREPAIDS
PRIOR YEAR RECEIVABLES - RECEIVED
PRIOR YEARS PAYABLES - DISBURSED
PRIOR-PERIOD EXPENSES
PROFESSIONAL/PARTNERSHIP EXP
Partner/GP Incent Mgmt Fees
Partnership - Accounting
Partnership - Fee
Partnership - Travel
Partnership / Owner Expense - Other
Partnership Accounting
Partnership Administration
Partnership Audit & Legal Expense
Partnership Audit Expense
Partnership Expense
Partnership Expenses
Partnership General Partner Fees
Partnership Income
Partnership Income/Expenses
Partnership Legal Expense
Partnership Legal Expenses
Partnership MN Minimum Fee
Partnership Management Fee - I/E
Partnership Management Fee-
Partnership Other Expenses
Partnership Tax
Partnership Taxes
Penalties
Persnl Prop-Computer Equipment
Persnl Prop-Office Equipment
Personal Prop Tax
Personal Prop Taxes
Personal Property
Personal Property Tax
Personal Property Taxes
Personal Property and Entity Taxes
Pest Income
Petty Cash
Petty Cash Loss
Prepaid - Other
Prepaid Insurance
Prepaid Liability Insurance
Prepaid MIP
Prepaid Mortgage Insurance
Prepaid Property & Liability Insurance
Prepaid Property Insurance
Prepaid Rent
Principal
Principal Mortgage Payable
Principal Payment
Principal on First Mortgage
Principal-Alliant
Prior Year
Prior Year Adjustments
Prior Year Expense
Prior Year Expenses
Prior Year Tax Adjustment
Prior Year Tax Adjustments
Professional Fees - Partnership
"Property Ta,.,s-Escrow"
Property Tax Impounds
Property Taxes ( escrow )
Property Taxes-Escrow
Property lnsurance(escrow)
Provision for losses on accounts receivable
R&M-INSURANCE CLAIMS
R/R Withdrawals
REFUND O/P INSURANCE
REFUND OF SECURITY DEPOSIT
RENT DELINQ INCR-(DECR)
RENT PP (INCR)-DECR
REPL RESERVE REIMBURSEME
REPLACEMENT RESERVE CASH
RESERVE FOR INSURANCE
RESERVE FOR TAXES
Real Estate Tax Escrow
Real Property - Reserve
Reconciliation Discrepancies
Refinance/Sale Expense
Refund of Prop Ins. Impounds
Renter's Insurance Claim Proceeds
Repl Res 1st Deposit
Repl Res 1st Interest
Replacement / Rehab Escrow
Replacement Reserve Escrow
Replacement Reserve Funding
Replacement Reserve Pymts
Reserve Interest-Non Operating
Reserves Escrow
Residual Receipts Disbursement
Return Deposits
SC Grant - Quality Assurance
SECURITY DEPOSITS REFUNDED
STARTUP EXPENSES
STATE INCOME TAX
SURETY BOND EXPENSE
Sales Commission
Sales Tax
Sales Tax Expense
Sales and Use Tax
Sales/Use/Excise Tax Expense
Sec Deposit Int-Accrued
Sec Deposit Refunds
Sec. Dep. Adjustments Post Closing
Second Mortgage Interest
Security Dep. Interest Paid to Tenants
Security Deposit Interest
Security Deposit Interest Expense
Security Deposits
Security Deposits - Clearing
Security Deposits Forfeited
Service Coordinator Grant Mileag
Sinking Fund Escrow
Start-Up
State Franchise Tax
State Franchise Taxes
State Income Tax
Surplus Cash Distribution
Suspended Capital
Suspense
Swap Interest Expense
T&I Funding
TAX ESCROW
TAXES-ESCROW
TAXES-PERSONAL
THC - INTER-CO INT EXP
THC - INTER-CO INT INC
TRAVEL-PARTNERSHIP EXPENSE
Tax & Insurance Reserve
Tax Appeal Refund - PY Taxes
Tax Escrow
Tax Rendering
Tax/Ins Reserve
Taxes - Franchise
Taxes - Personal Property
Taxes-Personal Property
Taxes-Personal Property Taxes
Taxes-State Income
Total Gain (Loss) on Sales of Investment
Total Interest Expense
Trade Accounts Payable
Transition Adjustments
Unclaimed Property Payable
Unfunded Security Dep Ref
Unfunded Security Dep Refund
Uninsured Loss
Uninsured Losses
Vendor Finance Charges
WF-Interest on Reserve Accounts
Walker Dunlop Interest
Walker Dunlop Principal
Interest
ln1erest - N/P
lnteresl Expense
 </excludedExpense>
 
4. Maintaining the sequence for the items the way it is given in the <pnl></pnl> data is critical.
5. If the statements where the headings and sub-headings are not given, consider the totals and sub-totals given for 
 classifying the items into corresponding categories is critical.
6. It would be preferred to classify line items as per heading or sub-heading or totals or sub-totals not based on 
 general english language. Eg . a lineitem \\"Landscaping Contract\\" given with a sub-total or subheading of Contract 
 services should be classified as Payroll category and contract services sub-category and if given with a sub-total or 
 subheading of Repairs should be classified under Repairs and Maintenance category.
 Classification on the basis of Document structure would always be preferred over general classification.
7. All the non-operating expenses should be also considered as Excluded expenses.
8. Items that are predicted as heading, sub-heading, totals, sub-totals from the text in <pnl></pnl> tags should have 
 NA for all the values except the lineitem header
9. If there is a number zero specified in the amount column it should not be treated as a no dollar value.
10. Format the final output as a csv that can easily be copied and pasted in Excel with headers of LineItem, Head, 
Category,  Sub-Category.
11. The final response must strictly contain only CSV data and no other additional text.  

</task>
`;
  }
}

