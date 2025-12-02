import { Enum } from '../../bootstrap/utils/Enum';

export class DispositionValuationModel extends Enum {
  static Trailing12MonthNOI = new DispositionValuationModel('T12NOI', 'Trailing 12 Month NOI');
  static Forward12MonthNOI = new DispositionValuationModel('F12NOI', 'Forward 12 Month NOI');
}
