import { Enum } from '../../../bootstrap/models/enums/Enum';

export class UnitStatus extends Enum {
  static Vacant = new UnitStatus('Vacant');
  static Occupied = new UnitStatus('Occupied');
  static get: (enumOrKey: UnitStatus | string) => UnitStatus = Enum.get.bind(UnitStatus);
}
