import { AbstractJobDispatcher } from '../../models/AbstractJobDispatcher';
import { Job } from '../../models/Job';
import { MemoryJobHandler } from './MemoryJobHandler';

export class MemoryJobDispatcher extends AbstractJobDispatcher {
  constructor(private readonly jobHandler: MemoryJobHandler) {
    super();
  }

  async dispatch(jobName: string, jobData: any, options: any) {
    const job = new Job(jobName, jobData, options);
    // skip the current event loop to allow db changes to be committed if any
    process.nextTick(() => this.jobHandler.handle(job));
  }
}
