import { Enum } from '../../../bootstrap/models/enums/Enum';


export class RRUnitInformationField extends Enum {
  static unit = new RRUnitInformationField('unit', 'Unit No.');
  static tenantCode = new RRUnitInformationField('tenant_code', 'Tenant Code');
  static tenantName = new RRUnitInformationField('tenant_name', 'Tenant Name');
  static floorPlan = new RRUnitInformationField('floor_plan', 'Floor Plan');
  static sqFt = new RRUnitInformationField('sq_ft', 'Sq Ft');
  static status = new RRUnitInformationField('status', 'Occupancy');
  static marketRent = new RRUnitInformationField('market_rent', 'Market rent');
  static noOfBedrooms = new RRUnitInformationField('no_of_bedrooms', 'Beds');
  static noOfBathrooms = new RRUnitInformationField('no_of_bathrooms', 'Baths');
  static unitType = new RRUnitInformationField('unit_type', 'Unit Type');
}

export class RRLeaseTermsField extends Enum {
  static startDate = new RRLeaseTermsField('start_date', 'Lease Start');
  static endDate = new RRLeaseTermsField('end_date', 'Lease Exp.');
  static leaseTerm = new RRLeaseTermsField('lease_term', 'Lease Term');
  static moveInDate = new RRLeaseTermsField('move_in_date', 'Move In');
  static moveOutDate = new RRLeaseTermsField('move_out_date', 'Move Out');
}

export class RRAdditionalField extends Enum {
  static subsidy = new RRAdditionalField('subsidy', 'Subsidy');
  static monthlyRent = new RRAdditionalField('monthly_rent', 'Monthly Rent');//
  static leaseType = new RRAdditionalField('lease_type', 'Document Lease Type');
  static annualRent = new RRAdditionalField('annual_rent', 'Annual Rent');
  static annualRentPsf = new RRAdditionalField('annual_rent_psf', 'Annual Rent PSF');
  static balance = new RRAdditionalField('balance', 'Balance');
  static bdBa = new RRAdditionalField('bd-ba', 'Bed-Bath');
  static begBalance = new RRAdditionalField('beg_balance', 'Beginning Balance');
  static bldgId = new RRAdditionalField('bldg_id', 'Bldg Id');
  static concession = new RRAdditionalField('concession', 'Concession');
  static deposit = new RRAdditionalField('deposit', 'Deposit');
  static endBalance = new RRAdditionalField('end_balance', 'End Balance');
  static leaseId = new RRAdditionalField('lease_id', 'Lease Id');
  static marketRentPsf = new RRAdditionalField('market_rent_psf', 'Market Rent PSF');
  static monthlyRentPsf = new RRAdditionalField('monthly_rent_psf', 'Monthly Rent PSF');
  static otherChargeCode = new RRAdditionalField('other_charge_code', 'other_charge_code');
  static otherHeader = new RRAdditionalField('other_header', 'Others');
  static potentialRent = new RRAdditionalField('potential_rent', 'Potential Rent');
  static remark = new RRAdditionalField('remark', 'Remarks');
  static totalCharges = new RRAdditionalField('total_charges', 'Total Charges');
  static transCode = new RRAdditionalField('trans_code', 'Trans Code');
  static vacancyLoss = new RRAdditionalField('vacancy_loss', 'Vacancy Loss');
  static variance = new RRAdditionalField('variance', 'Variance');
}

export class RentRollFixedField extends Enum {
  static Renovated = new RentRollFixedField('Renovated', 'Renovated');
  static Affordable = new RentRollFixedField('Affordable', 'Affordable');
  static MTM = new RentRollFixedField('MTM', 'MTM');
}
