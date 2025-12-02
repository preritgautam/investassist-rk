import { inject, injectable } from '../boot';
import { DocumentExtractionManager } from '../service/manager/DocumentExtractionManager';
import { AbstractJobHandler } from '../../framework/plugins/JobPlugin/AbstractJobHandler';
import { Job } from '../../framework/plugins/JobPlugin/models/Job';
import { EntityNotFoundError } from 'typeorm';

@injectable({
  alias: 'job.extract.document.handler',
})
export class ExtractDocumentHandler extends AbstractJobHandler {
  constructor(
    @inject(DocumentExtractionManager) private readonly extractionManager: DocumentExtractionManager,
  ) {
    super();
  }

  async handleJob(job: Job) {
    const { documentId } = job.data;
    try {
      await this.extractionManager.extractDocument(documentId);
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        // Although memory job runs in the next tick, ORM at times fails to find the document with the id
        // we just try extraction again in such a case
        await this.extractionManager.extractDocument(documentId);
      }
    }
  }
}
