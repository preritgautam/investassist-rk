import { NormalizeOptions } from '../NormalizerService';

export abstract class AbstractNormalizer {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static supports(value: any): boolean {
    return false;
  };

  abstract normalize(value: any, options: NormalizeOptions): any;
}

