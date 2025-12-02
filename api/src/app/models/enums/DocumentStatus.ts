import { Enum } from '../../../bootstrap/models/enums/Enum';

export class DocumentStatus extends Enum {
  // Document in uploaded state
  static New = new DocumentStatus('New');
  // Extraction in progress
  static Processing = new DocumentStatus('Processing');
  // Data Processed
  static Processed = new DocumentStatus('Processed');
  // Data Extraction Failed
  static Failed = new DocumentStatus('Failed');
  // Data Validated
  static Validated = new DocumentStatus('Validated');
}
