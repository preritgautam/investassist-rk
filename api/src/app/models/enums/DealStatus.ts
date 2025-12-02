import { Enum } from '../../../bootstrap/models/enums/Enum';

export class DealStatus extends Enum {
  static NEW = new DealStatus('New', 0);
  static IN_PROGRESS = new DealStatus('In Progress', 1);
  static COMPLETED = new DealStatus('Completed', 2);

  static get: (enumOrKey: DealStatus | string) => DealStatus = Enum.get.bind(DealStatus);
  public readonly sortOrder: number;

  constructor(key: string, sortOrder: number) {
    super(key);
    this.sortOrder = sortOrder;
  }
}
