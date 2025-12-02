import { Enum } from '../../../bootstrap/models/enums/Enum';

export class AssetType extends Enum {
  static Multifamily = new AssetType('MULTIFAMILY');
  static get: (enumOrKey: AssetType | string) => AssetType = Enum.get.bind(AssetType);
}
