import { Enum } from '../../bootstrap/utils/Enum';

export class AffordableLeaseTypes extends Enum {
  static Market = new AffordableLeaseTypes('Market', 'Market');
  static Affordable = new AffordableLeaseTypes('Affordable', 'Affordable');
  static Section8 = new AffordableLeaseTypes('Section 8', 'Section 8');
  static RentControlled = new AffordableLeaseTypes('Rent Controlled', 'Rent Controlled');
  static Other = new AffordableLeaseTypes('Other', 'Other');
}
