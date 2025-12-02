import { Enum } from '../../../bootstrap/models/enums/Enum';

export class RentRollChargeCode extends Enum {
  static MonthlyRent = new RentRollChargeCode('MonthlyRent', 'Monthly Rent');
  static GarageParking = new RentRollChargeCode('GarageParking', 'Garage & Parking');
  static Storage = new RentRollChargeCode('Storage', 'Storage');
  static DepositForfeiture = new RentRollChargeCode('DepositForfeiture', 'Deposit Forfeiture');
  static PetFees = new RentRollChargeCode('PetFees', 'Pet Fees');
  static ExpenseReimbursements = new RentRollChargeCode('ExpenseReimbursements', 'Expense Reimbursements');
  static MiscellaneousOtherIncome = new RentRollChargeCode('MiscellaneousOtherIncome', 'Miscellaneous Other Income');
  static Concessions = new RentRollChargeCode('Concessions', 'Concessions');
  static Subsidy = new RentRollChargeCode('Subsidy', 'Subsidy');
  static CableInternet = new RentRollChargeCode('CableInternet', 'Cable & Internet');
  static ValetTrash = new RentRollChargeCode('ValetTrash', 'Valet Trash');
}
