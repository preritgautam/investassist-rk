import axios from 'axios';
import FormData = require('form-data');
import { injectable } from '../../boot';
import { config } from '../../../framework/plugins/AppConfigPlugin/AppConfigPlugin';
import { AssetType } from '../../models/enums/AssetType';
import { DocumentType } from '../../models/enums/DocumentType';
import { AppConfigType } from '../../config';
import { ExtractionFailedError } from '../../errors/ExtractionFailedError';
import { Readable } from 'stream';


export interface ExtractDocumentParams {
  assetType: AssetType,
  documentType: DocumentType,
  file: Buffer | Readable,
  fileName: string,
  from?: string | number,
  to?: string | number,
  sheet?: string | number,
}

@injectable()
class MLExtractionService {
  constructor(
    @config('clikGateway') private readonly cgConfig: AppConfigType['clikGateway'],
    @config('ml') private readonly mlConfig: AppConfigType['ml'],
  ) {
  }

  async extractDocument(extractionRequest: ExtractDocumentParams) {
    const { apiBaseUrl, key, secret } = this.cgConfig;
    const { apiSlug, extractApi } = this.mlConfig;

    const postData = new FormData({ maxDataSize: 100 * 1024 * 1024 });
    postData.append('assetType', extractionRequest.assetType.key);
    postData.append('document_title', extractionRequest.documentType.key);
    postData.append('from', extractionRequest.from || '');
    postData.append('to', extractionRequest.to || '');
    postData.append('request_model_type', 'invest_assist');
    postData.append('file', extractionRequest.file, { filename: extractionRequest.fileName });

    const resp = await axios.post(
      `${apiBaseUrl}/api/proxy/call/${apiSlug}/${extractApi}`,
      postData,
      {
        auth: {
          username: key,
          password: secret,
        },
        headers: postData.getHeaders(),
        maxBodyLength: 1024 * 1024 * 100, // 100MB
        maxContentLength: 1024 * 1024 * 100, // 100MB
      },
    );

    if (resp.data.status === 'error') {
      throw new ExtractionFailedError(extractionRequest);
    }

    return resp.data;
  }
}

export { MLExtractionService };
