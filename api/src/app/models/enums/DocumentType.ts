import { Enum } from '../../../bootstrap/models/enums/Enum';

export class DocumentType extends Enum {
  static CF = new DocumentType('CF');
  static RRF = new DocumentType('RRF');

  static get: (enumOrKey: DocumentType | string) => DocumentType = Enum.get.bind(DocumentType);
}
