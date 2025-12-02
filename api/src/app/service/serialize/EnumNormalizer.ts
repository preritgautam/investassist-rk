import { AbstractNormalizer } from '../../../framework/plugins/SerializerPlugin/service/normalizer/AbstractNormalizer';
import { injectable } from '../../boot';
import { Enum } from '../../../bootstrap/models/enums/Enum';

@injectable()
export class EnumNormalizer extends AbstractNormalizer {
  normalize(enumValue: Enum): string {
    return enumValue.key;
  }

  static supports(value: any): boolean {
    return value instanceof Enum;
  };
}
