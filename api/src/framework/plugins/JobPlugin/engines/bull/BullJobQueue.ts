import * as Bull from 'bull';
import { JobPluginOptions } from '../../JobPlugin';

export class BullJobQueue {
  queue: Bull.Queue = null;

  constructor(jobsConfig: JobPluginOptions) {
    this.queue = new Bull(jobsConfig.bull.queue.name, {
      defaultJobOptions: {
        removeOnComplete: true,
      },
      redis: jobsConfig.bull.redis,
    });
  }

  add(job: string, data: any, options: Bull.JobOptions): Promise<Bull.Job> {
    return this.queue.add(job, data, options);
  }
}
