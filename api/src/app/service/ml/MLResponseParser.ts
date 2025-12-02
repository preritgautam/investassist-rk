import { inject, injectable } from '../../boot';
import { ExtractDocumentParams } from './MLExtractionService';
import { DocumentType } from '../../models/enums/DocumentType';
import { AssetType } from '../../models/enums/AssetType';
import { CFResponseParser } from './CFResponseParser';
import { MFRRFResponseParser } from './MFRRFResponseParser';

@injectable()
class MLResponseParser {
  constructor(
    @inject(MFRRFResponseParser) private mfRRFResponseParser: MFRRFResponseParser,
    @inject(CFResponseParser) private cfResponseParser: CFResponseParser,
  ) {
  }

  public parseResponse(extractionRequest: ExtractDocumentParams, mlResponse) {
    if (extractionRequest.documentType === DocumentType.CF) {
      return this.cfResponseParser.parseResponse(extractionRequest, mlResponse);
    } else if (extractionRequest.documentType === DocumentType.RRF) {
      if (extractionRequest.assetType === AssetType.Multifamily) {
        return this.mfRRFResponseParser.parseResponse(extractionRequest, mlResponse);
      }
    } else {
      throw new Error('unknown document type');
    }
  }
}

export { MLResponseParser };
