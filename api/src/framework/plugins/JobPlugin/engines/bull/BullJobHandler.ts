import { Job as BullJob } from 'bull';
import { AbstractJobHandler } from '../../AbstractJobHandler';
import { JobHandlerServiceLocator } from '../../service/JobHandlerServiceLocator';
import { Job } from '../../models/Job';

export class BullJobHandler {
  constructor(
    private readonly jobHandlerLocator: JobHandlerServiceLocator,
    private readonly jobsConfig,
  ) {
  }

  public async handle(bullJob: BullJob) {
    let handlers = this.jobsConfig.handlers[bullJob.name];
    if (typeof handlers === 'string') {
      handlers = [handlers];
    }

    const job = new Job(bullJob.name, bullJob.data, bullJob.opts, bullJob);

    // TODO: Replace Promise.all with Promise.allSettled
    return Promise.all(handlers.map(async (handler) => {
      const handlerService: AbstractJobHandler = await this.jobHandlerLocator.resolve2(handler);
      try {
        await handlerService.handleJob(job);
      } catch (e) {
        console.error(e);
        throw e;
      }
    }));
  }
}
