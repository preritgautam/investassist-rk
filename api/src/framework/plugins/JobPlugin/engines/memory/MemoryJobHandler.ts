import { AbstractJobHandler } from '../../AbstractJobHandler';
import { JobHandlerServiceLocator } from '../../service/JobHandlerServiceLocator';
import { Job } from '../../models/Job';

export class MemoryJobHandler {
  constructor(
    private readonly jobHandlerLocator: JobHandlerServiceLocator,
    private readonly jobsConfig,
  ) {
  }

  public async handle(job: Job) {
    let handlers = this.jobsConfig.handlers[job.name];
    if (typeof handlers === 'string') {
      handlers = [handlers];
    }

    return Promise.allSettled(handlers.map(async (handler) => {
      const handlerService: AbstractJobHandler = await this.jobHandlerLocator.resolve2(handler);
      return handlerService.handleJob(job);
    }));
  }
}
