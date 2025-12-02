import { BullJobQueue } from './BullJobQueue';
import { AbstractJobDispatcher } from '../../models/AbstractJobDispatcher';

export class BullJobDispatcher extends AbstractJobDispatcher {
  constructor(private readonly queue: BullJobQueue) {
    super();
  }

  public async dispatch(jobName, jobData, jobOptions) {
    return this.queue.add(jobName, jobData, jobOptions);
  }
}
