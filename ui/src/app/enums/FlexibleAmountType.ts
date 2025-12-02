import { Enum, EnumOrKey } from '../../bootstrap/utils/Enum';

export class FlexibleAmountType extends Enum {
  constructor(key: string, label: string, public readonly valueType: '$' | '%') {
    super(key, label);
  }

  static dollarPerUnit = new FlexibleAmountType('dollarPerUnit', 'Dollar Per Unit', '$');
  static dollarPerOccupiedUnit = new FlexibleAmountType('dollarPerOccupiedUnit', 'Dollar Per Occupied Unit', '$');
  static dollarPerSqFt = new FlexibleAmountType('dollarPerSqFt', 'Dollar Per SqFt', '$');
  static percentEGI = new FlexibleAmountType('percentEGI', '% EGI', '%');
  static total = new FlexibleAmountType('total', 'Total', '$');
  static onHistorical = new FlexibleAmountType('onHistorical', 'On Historical', '$');
  static atClose = new FlexibleAmountType('atClose', 'At Close', '$');

  static get(key: EnumOrKey): FlexibleAmountType {
    return super.get(key);
  }
}
