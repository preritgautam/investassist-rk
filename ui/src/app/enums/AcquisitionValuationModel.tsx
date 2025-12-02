import { Enum, EnumOrKey } from '../../bootstrap/utils/Enum';

export class AcquisitionValuationModel extends Enum {
  constructor(key: string, label: string, public readonly valueType: '%' | '$' | '#') {
    super(key, label);
  }

  static TotalPrice = new AcquisitionValuationModel('TotalPrice', 'Total Price', '$');
  static PricePerUnit = new AcquisitionValuationModel('PricePerUnit', 'Price Per Unit', '$');
  static ProformaCapRate = new AcquisitionValuationModel('ProformaCapRate', 'Proforma Cap Rate', '%');
  static HistoricalCapRate = new AcquisitionValuationModel('HistoricalCapRate', 'Historical Cap Rate', '%');
  static LeveragedIRR = new AcquisitionValuationModel('LeveragedIRR', 'Leveraged IRR', '#');

  static get(key: EnumOrKey): AcquisitionValuationModel {
    return super.get(key);
  }
}
