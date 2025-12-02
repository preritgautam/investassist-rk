import * as Bull from 'bull';
import { BullJobHandler } from './BullJobHandler';
import { Job } from 'bull';
import { JobPluginOptions } from '../../JobPlugin';

export class BullJobWorker {
  worker: Bull.Queue = null;

  constructor(
    private readonly jobHandler: BullJobHandler,
    private readonly jobsConfig: JobPluginOptions,
  ) {
    this.worker = new Bull(jobsConfig.bull.queue.name, {
      redis: jobsConfig.bull.redis,
    });

    Reflect.ownKeys(jobsConfig.handlers).forEach((jobName: string) => {
      this.worker.process(
        jobName,
        async (job: Job) => await this.jobHandler.handle(job),
      ).catch(console.error);
    });
  }
}

