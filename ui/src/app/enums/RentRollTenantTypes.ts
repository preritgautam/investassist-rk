import { Enum } from '../../bootstrap/utils/Enum';

export class RentRollTenantTypes extends Enum {
  static Commercial = new RentRollTenantTypes('Commercial', 'Commercial');
  static Residential = new RentRollTenantTypes('Residential', 'Residential');
}
