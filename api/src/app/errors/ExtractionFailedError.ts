import { ExtractDocumentParams } from '../service/ml/MLExtractionService';

export class ExtractionFailedError extends Error {
  constructor(public readonly extractParams: ExtractDocumentParams) {
    super();
  }
}
