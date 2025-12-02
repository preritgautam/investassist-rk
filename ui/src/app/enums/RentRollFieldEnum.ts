import { Enum, EnumType } from '../../bootstrap/utils/Enum';
import { AffordableLeaseTypes } from './AffordableLeaseTypes';


export interface FieldOptions {
  summary: 'sum' | 'unique' | null;
  type: 'amount' | 'amount_psf' | 'number' | 'date' | 'bool' | 'enum' | null;
  enumType?: EnumType;
  hidden?: boolean;
}

export interface RentRollFieldInterface {
  key: string;
  label: string;
  options: FieldOptions;
}

export abstract class RentRollField extends Enum implements RentRollFieldInterface {
  constructor(
    key: string, label: string,
    public readonly options: FieldOptions,
  ) {
    super(key, label);
  }
}

export class RRUnitInformationField extends RentRollField {
  static unit = new RRUnitInformationField('unit', 'Unit No.', { type: null, summary: 'unique' });
  static tenantCode = new RRUnitInformationField('tenant_code', 'Tenant Code', {
    type: null,
    summary: 'unique',
  });
  static tenantName = new RRUnitInformationField('tenant_name', 'Tenant Name', { type: null, summary: null });
  static floorPlan = new RRUnitInformationField('floor_plan', 'Floor Plan', { type: null, summary: 'unique' });
  static sqFt = new RRUnitInformationField('sq_ft', 'Sq Ft', { type: 'number', summary: 'sum' });
  static status = new RRUnitInformationField('status', 'Occupancy', { type: null, summary: null });
  static marketRent = new RRUnitInformationField('market_rent', 'Market rent', { type: 'amount', summary: 'sum' });
  static noOfBedrooms = new RRUnitInformationField('no_of_bedrooms', 'Beds', { type: 'number', summary: 'unique' });
  static noOfBathrooms = new RRUnitInformationField('no_of_bathrooms', 'Baths', { type: 'number', summary: 'unique' });
  static unitType = new RRUnitInformationField('unit_type', 'Unit Type', { type: null, summary: 'unique' });
}

export class RRLeaseTermsField extends RentRollField {
  static startDate = new RRLeaseTermsField('start_date', 'Lease Start', { type: 'date', summary: null });
  static endDate = new RRLeaseTermsField('end_date', 'Lease Exp.', { type: 'date', summary: null });
  static leaseTerm = new RRLeaseTermsField('lease_term', 'Lease Term', { type: null, summary: null });
  static moveInDate = new RRLeaseTermsField('move_in_date', 'Move In', { type: 'date', summary: null });
  static moveOutDate = new RRLeaseTermsField('move_out_date', 'Move Out', { type: 'date', summary: null });
}

export class RRAdditionalField extends RentRollField {
  static monthlyRent = new RRAdditionalField('monthly_rent', 'Monthly Rent', {
    type: 'amount',
    summary: 'sum',
    hidden: true,
  });
  static subsidy = new RRAdditionalField('subsidy', 'Subsidy', { type: 'amount', summary: 'sum', hidden: true });
  static leaseType = new RRAdditionalField('lease_type', 'Document Lease Type', { type: null, summary: null });
  static annualRent = new RRAdditionalField('annual_rent', 'Annual Rent', { type: 'amount', summary: 'sum' });
  static annualRentPsf = new RRAdditionalField('annual_rent_psf', 'Annual Rent PSF', {
    type: 'amount_psf',
    summary: 'sum',
  });
  static balance = new RRAdditionalField('balance', 'Balance', { type: 'amount', summary: 'sum' });
  static bdBa = new RRAdditionalField('bd-ba', 'Bed-Bath', { type: null, summary: 'unique' });
  static begBalance = new RRAdditionalField('beg_balance', 'Beginning Balance', { type: 'amount', summary: 'sum' });
  static bldgId = new RRAdditionalField('bldg_id', 'Bldg Id', { type: null, summary: null });
  static concession = new RRAdditionalField('concession', 'Concession', {
    type: 'amount',
    summary: 'sum',
    hidden: true,
  });
  static deposit = new RRAdditionalField('deposit', 'Deposit', { type: 'amount', summary: 'sum' });
  static endBalance = new RRAdditionalField('end_balance', 'End Balance', {
    type: 'amount',
    summary: 'sum',
  });
  static leaseId = new RRAdditionalField('lease_id', 'Lease Id', { type: null, summary: 'unique' });
  static marketRentPsf = new RRAdditionalField('market_rent_psf', 'Market Rent PSF', {
    type: 'amount_psf',
    summary: 'sum',
  });
  static monthlyRentPsf = new RRAdditionalField('monthly_rent_psf', 'Monthly Rent PSF', {
    type: 'amount_psf',
    summary: 'sum',
  });
  static otherChargeCode = new RRAdditionalField('other_charge_code', 'other_charge_code', {
    type: 'amount',
    summary: 'sum',
    hidden: true,
  });
  static otherHeader = new RRAdditionalField('other_header', 'Others', { type: null, summary: null });
  static potentialRent = new RRAdditionalField('potential_rent', 'Potential Rent', {
    type: 'amount',
    summary: 'sum',
    hidden: true,
  });
  static remark = new RRAdditionalField('remark', 'Remarks', { type: null, summary: null });
  static totalCharges = new RRAdditionalField('total_charges', 'Total Charges', {
    type: 'amount',
    summary: 'sum',
  });
  static transCode = new RRAdditionalField('trans_code', 'Trans Code', { type: null, summary: null });
  static vacancyLoss = new RRAdditionalField('vacancy_loss', 'Vacancy Loss', {
    type: 'amount',
    summary: 'sum',
  });
  static variance = new RRAdditionalField('variance', 'Variance', { type: 'number', summary: null });
}

export class RentRollFixedField extends RentRollField {
  static Renovated = new RentRollFixedField('Renovated', 'Renovated', { type: 'bool', summary: 'sum' });
  static Affordable = new RentRollFixedField(
    'Affordable',
    'Affordable',
    {
      type: 'enum',
      summary: null,
      enumType: AffordableLeaseTypes,
    },
  );
  static MTM = new RentRollFixedField('MTM', 'MTM', { type: 'bool', summary: 'sum' });
}


export class RentRollChargeCodeField implements RentRollFieldInterface {
  public readonly options: FieldOptions = { type: 'amount', summary: 'sum' };

  constructor(public readonly key, public readonly label) {
  }
}

// export class RentRollFutureField extends Enum {
//   static ActualRentF = new RentRollFutureField('ActualRentF', 'Actual Rent (F)');
//   static RecurringConcessionF = new RentRollFutureField('RecurringConcessionF', 'Recurring Concession. (F)');
//   static NetEffectiveRentF = new RentRollFutureField('NetEffectiveRentF', 'Net Effective Rent (F)');
//   static SupplementalRentF = new RentRollFutureField('SupplementalRentF', 'Supplemental Rent (F)');
//   static UpfrontConcessionF = new RentRollFutureField('UpfrontConcessionF', 'Upfront Concession.(F)');
//   static EmployeeOtherDiscountF = new RentRollFutureField('EmployeeOtherDiscountF', 'Employee/Other Discount (F)');
//   static OtherIncomeF = new RentRollFutureField('OtherIncomeF', 'Other Income (F)');
//   static LeaseStartF = new RentRollFutureField('LeaseStartF', 'Lease Start (F)');
//   static LeaseExpiryF = new RentRollFutureField('LeaseExpiryF', 'Lease Exp.(F)');
//   static LeaseTermF = new RentRollFutureField('LeaseTermF', 'Lease Term (F)');
//   static MoveInF = new RentRollFutureField('MoveInF', 'Move In (F)');
//   static MoveOutF = new RentRollFutureField('MoveOutF', 'Move Out (F)');
// }
