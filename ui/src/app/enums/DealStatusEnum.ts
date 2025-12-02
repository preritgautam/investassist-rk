import { Enum } from '../../bootstrap/utils/Enum';

export class DealStatusEnum extends Enum {
  static NEW = new DealStatusEnum('New');
  static IN_PROGRESS = new DealStatusEnum('In Progress');
  static COMPLETED = new DealStatusEnum('Completed');

  static get: (enumOrKey: DealStatusEnum | string) => DealStatusEnum = Enum.get.bind(DealStatusEnum);
}
